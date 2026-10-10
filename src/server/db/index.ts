import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import pg from 'pg';

export interface DatabaseState {
  roles: any[];
  users: any[];
  user_roles: any[];
  therapists: any[];
  therapist_credentials: any[];
  service_categories: any[];
  services: any[];
  therapist_services: any[];
  packages: any[];
  package_services: any[];
  availability_rules: any[];
  availability_exceptions: any[];
  bookings: any[];
  payments: any[];
  settlements: any[];
  audit_logs: any[];
  business_settings: Record<string, any>;
  faqs: any[];
  testimonials: any[];
  contact_messages: any[];
  client_profiles?: any[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'be_sawa_db.json');

class RelationalDatabase {
  private memoryState: DatabaseState | null = null;
  private pgPool: pg.Pool | null = null;
  private isPg = false;

  constructor() {
    if (process.env.DATABASE_URL) {
      try {
        this.pgPool = new pg.Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
        });
        this.isPg = true;
        console.log('Connected to PostgreSQL via DATABASE_URL');
      } catch (err) {
        console.warn('PostgreSQL initialization failed, falling back to ACID local store:', err);
        this.isPg = false;
      }
    }
  }

  public async init(): Promise<void> {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const initial = await this.generateBootstrapState();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      this.memoryState = initial;
      console.log('Be Sawa database initialized with secure bootstrap data.');
    } else {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.memoryState = JSON.parse(raw);
        // Automatic runtime migration & sanitization:
        if (this.memoryState) {
          let modified = false;

          // 1. Ensure V1 Roles exist
          const now = new Date().toISOString();
          const requiredRoles = [
            { id: 'role_business_owner_admin', name: 'BUSINESS_OWNER_ADMIN', description: 'Muthoni Maina - Business owner, clinical oversight, appointments, rates & settlements', created_at: now },
            { id: 'role_platform_admin', name: 'PLATFORM_ADMIN', description: 'Stephen / Ma Creatives - Technical infrastructure, platform maintenance & security audits', created_at: now },
            { id: 'role_super_admin', name: 'SUPER_ADMIN', description: 'Complete system authority and compliance oversight', created_at: now },
            { id: 'role_admin', name: 'ADMIN', description: 'Operations, bookings, therapists, and content management', created_at: now },
            { id: 'role_therapist', name: 'THERAPIST', description: 'Licensed mental health practitioner view', created_at: now },
            { id: 'role_client', name: 'CLIENT', description: 'Public service user', created_at: now },
          ];

          for (const reqRole of requiredRoles) {
            const exists = this.memoryState.roles.find((r) => r.name === reqRole.name || r.id === reqRole.id);
            if (!exists) {
              this.memoryState.roles.push(reqRole);
              modified = true;
            } else if (reqRole.id === 'role_business_owner_admin') {
              exists.description = reqRole.description;
              modified = true;
            }
          }

          // 2. Ensure Founder (Muthoni Maina) has BUSINESS_OWNER_ADMIN role
          const founderUser = this.memoryState.users.find(
            (u) => u.email === 'admin@besawa.ke' || u.email === 'admin@besawa.co.ke' || u.full_name.includes('Helen') || u.full_name.includes('Muthoni')
          );
          if (founderUser) {
            founderUser.full_name = 'Muthoni Maina';
            const hasOwnerRole = this.memoryState.user_roles.some(
              (ur) => ur.user_id === founderUser.id && (ur.role_id === 'role_business_owner_admin' || ur.role_id === 'BUSINESS_OWNER_ADMIN')
            );
            if (!hasOwnerRole) {
              this.memoryState.user_roles.push({
                user_id: founderUser.id,
                role_id: 'role_business_owner_admin',
                assigned_at: now,
              });
            }
            modified = true;
          }

          // 3. Ensure Stephen / Ma Creatives has PLATFORM_ADMIN technical account
          const stephenUser = this.memoryState.users.find(
            (u) => u.email === 'macreatives.global@gmail.com' || u.email === 'stephen@macreatives.studio'
          );
          if (!stephenUser) {
            const stephenId = 'usr_platform_admin_stephen';
            const technicalAdminPassword = process.env.TECHNICAL_ADMIN_PASSWORD;
            if (process.env.NODE_ENV === 'production' && !technicalAdminPassword) {
              console.warn('TECHNICAL_ADMIN_PASSWORD is not set; skipping optional platform-admin provisioning.');
            } else {
              const defaultTechHash = bcrypt.hashSync(technicalAdminPassword || 'local-development-password-change-me', 10);
              this.memoryState.users.push({
                id: stephenId,
                email: 'macreatives.global@gmail.com',
                password_hash: defaultTechHash,
                full_name: 'Stephen (Ma Creatives)',
                phone: '0710759422',
                is_active: true,
                last_login_at: null,
                created_at: now,
                updated_at: now,
              });
              this.memoryState.user_roles.push({
                user_id: stephenId,
                role_id: 'role_platform_admin',
                assigned_at: now,
              });
              modified = true;
            }
          }

          // 4. Seed only missing practitioner records. Existing records are admin-managed
          // and must never be overwritten on every server restart.
          const verifiedPractitioners = [
            {
              id: 'thp_magdalene_mwende',
              user_id: null,
              full_name: 'Magdalene Mwende Kimanzi',
              title: 'Psychological Counsellor',
              bio: 'Magdalene specializes in compassionate trauma recovery and anxiety management. Grounded in empathetic listening, she provides a safe, non-judgmental space for clients to process overwhelming experiences and rebuild internal calm.',
              years_experience: 5,
              languages: ['Kiswahili', 'English'],
              areas_of_practice: ['Trauma', 'Anxiety', 'Emotional Resilience', 'Life Transitions'],
              profile_photo_url: '/images/therapists/magdalene.jpg',
              verification_status: 'APPROVED' as const,
              is_active: true,
              supports_online: true,
              supports_in_person: true,
              session_rate_override: null,
              internal_admin_notes: 'Approved practitioner. Specialization: trauma, anxiety. Languages: Kiswahili, English.',
              created_at: now,
              updated_at: now,
            },
            {
              id: 'thp_chuot_magok',
              user_id: null,
              full_name: 'Chuot Magok',
              title: 'Adolescent & Trauma Specialist',
              bio: 'Chuot focuses on trauma rehabilitation, adolescent mental health, and acute life stress. Experienced in cross-cultural counselling across English and Sudanese dialects, fostering resilience and emotional safety.',
              years_experience: 5,
              languages: ['English', 'Sudanese'],
              areas_of_practice: ['Trauma', 'Adolescent Care', 'Stress Management', 'Youth Resilience'],
              profile_photo_url: '/images/therapists/chuot.jpg',
              verification_status: 'APPROVED' as const,
              is_active: true,
              supports_online: true,
              supports_in_person: true,
              session_rate_override: null,
              internal_admin_notes: 'Approved practitioner. Specialties: trauma, adolescent, stress. Languages: English, Sudanese.',
              created_at: now,
              updated_at: now,
            },
            {
              id: 'thp_ikwa_bawoso',
              user_id: null,
              full_name: 'Ikwa Bawoso Levi',
              title: 'Mental Wellness Counsellor',
              bio: 'Ikwa provides compassionate psychological care across stress alleviation, anxiety navigation, grief support, and self-esteem restoration. Fluent in English and French.',
              years_experience: 5,
              languages: ['English', 'French'],
              areas_of_practice: ['Stress', 'Anxiety', 'Grief', 'Self-Esteem'],
              profile_photo_url: '/images/therapists/bawoso.jpg',
              verification_status: 'APPROVED' as const,
              is_active: true,
              supports_online: true,
              supports_in_person: true,
              session_rate_override: null,
              internal_admin_notes: 'Approved bilingual practitioner. Specialties: stress, anxiety, grief, self-esteem. Languages: English, French.',
              created_at: now,
              updated_at: now,
            },
            {
              id: 'thp_caroline_nyaguthii',
              user_id: null,
              full_name: 'Caroline Nyaguthii Maina',
              title: 'Child & Family Counsellor',
              bio: 'Caroline supports clients through grief, chronic stress, anxiety, personal self-development, and emotional wellness for children and families with gentle presence.',
              years_experience: 6,
              languages: ['Kiswahili', 'English'],
              areas_of_practice: ['Grief', 'Stress', 'Anxiety', 'Self-Development', 'Kids'],
              profile_photo_url: '/images/therapists/caroline.jpg',
              verification_status: 'APPROVED' as const,
              is_active: true,
              supports_online: true,
              supports_in_person: true,
              session_rate_override: null,
              internal_admin_notes: 'Approved practitioner. Specialties: grief, stress, anxiety, self-development, kids.',
              created_at: now,
              updated_at: now,
            },
            {
              id: 'thp_jeremiah_parseketo',
              user_id: null,
              full_name: 'Jeremiah Parseketo Lei',
              title: 'Youth & Inclusive Care Counsellor',
              bio: 'Jeremiah specializes in trauma integration, anxiety relief, youth mental wellness, and accessible psychological care for physically challenged individuals.',
              years_experience: 6,
              languages: ['Kiswahili', 'English'],
              areas_of_practice: ['Trauma', 'Anxiety', 'Physically Challenged', 'Youth'],
              profile_photo_url: '/images/therapists/jeremiah.jpg',
              verification_status: 'APPROVED' as const,
              is_active: true,
              supports_online: true,
              supports_in_person: true,
              session_rate_override: null,
              internal_admin_notes: 'Approved practitioner. Specialties: trauma, anxiety, physically challenged, youth.',
              created_at: now,
              updated_at: now,
            },
            {
              id: 'thp_joyce_wothaya',
              user_id: null,
              full_name: 'Joyce Wothaya Kamau',
              title: 'Child & Adolescent Behavioural Counsellor',
              bio: 'Joyce offers therapeutic guidance in grief recovery, healthy self-development, behavioral interventions, and emotional support for children and adolescents.',
              years_experience: 7,
              languages: ['Kiswahili', 'English'],
              areas_of_practice: ['Grief', 'Self-Development', 'Behavioural', 'Kids', 'Adolescent'],
              profile_photo_url: '/images/therapists/joice.jpg',
              verification_status: 'APPROVED' as const,
              is_active: true,
              supports_online: true,
              supports_in_person: true,
              session_rate_override: null,
              internal_admin_notes: 'Approved practitioner. Specialties: grief, self-development, behavioural, kids, adolescent.',
              created_at: now,
              updated_at: now,
            },
            {
              id: 'thp_patrick_rinye',
              user_id: null,
              full_name: 'Patrick Rinye',
              title: 'Youth & Trauma Specialist',
              bio: 'Patrick is dedicated to youth empowerment, anxiety relief, trauma integration, and compassionate grief companionship in structured, safe environments.',
              years_experience: 5,
              languages: ['Kiswahili', 'English'],
              areas_of_practice: ['Youth', 'Anxiety', 'Trauma', 'Grief'],
              profile_photo_url: '/images/therapists/patrick.jpg',
              verification_status: 'APPROVED' as const,
              is_active: true,
              supports_online: true,
              supports_in_person: true,
              session_rate_override: null,
              internal_admin_notes: 'Approved practitioner. Specialties: youth, anxiety, trauma, grief.',
              created_at: now,
              updated_at: now,
            },
            {
              id: 'thp_unnamed_pending_8',
              user_id: null,
              full_name: 'Practitioner Candidate (Profile Incomplete)',
              title: 'Practitioner Candidate',
              bio: 'Submitted practitioner profile currently pending identity details and credential verification. Withheld from public directory.',
              years_experience: 0,
              languages: ['English'],
              areas_of_practice: ['General Wellness'],
              profile_photo_url: '',
              verification_status: 'UNDER_REVIEW' as const,
              is_active: false,
              supports_online: false,
              supports_in_person: false,
              session_rate_override: null,
              internal_admin_notes: 'One additional unnamed practitioner profile exists in submitted material. Withheld from public directory until required identity and professional information is supplied.',
              created_at: now,
              updated_at: now,
            },
            {
              id: 'thp_muthoni_maina',
              user_id: 'usr_super_admin_1',
              full_name: 'Muthoni Maina',
              
              title: 'Verified Psychologist',
              bio: 'Muthoni offers a calm, person-centred space for adults navigating stress, relationship concerns, emotional wellbeing, and life transitions. Her approach is compassionate, practical, and paced around each client’s goals.',
              years_experience: 5,
              languages: ['English', 'Kiswahili'],
              areas_of_practice: ['Individual Therapy', 'Stress Management', 'Relationship Support', 'Life Transitions'],
              profile_photo_url: '/images/therapists/muthoni.jpg',
              verification_status: 'VERIFIED' as const,
              is_active: true,
              supports_online: true,
              supports_in_person: true,
              session_rate_override: null,
              internal_admin_notes: 'Verified psychologist profile approved for public directory on 2026-10-02.',

              created_at: now,
              updated_at: now,
            },
            {
              id: 'thp_cyrus_musyoki',
              user_id: null,
              full_name: 'Cyrus Mbatha Musyoki',
              
              title: 'Verified Psychologist',
              bio: 'Cyrus provides grounded psychological support for adults and young people working through anxiety, stress, emotional resilience, and meaningful life change. He brings a warm, collaborative approach to each session.',
              years_experience: 5,
              languages: ['English', 'Kiswahili'],
              areas_of_practice: ['Anxiety Support', 'Stress Management', 'Emotional Resilience', 'Youth Wellbeing'],
              profile_photo_url: '/images/therapists/cyrus.jpg',
              verification_status: 'VERIFIED' as const,
              is_active: true,
              supports_online: true,
              supports_in_person: true,
              session_rate_override: null,
              internal_admin_notes: 'Verified psychologist profile approved for public directory on 2026-10-02.',

              created_at: now,
              updated_at: now,
            },
            ...['01', '02', '03'].map((profileNumber) => ({
              id: `thp_onboarding_${profileNumber}`,
              user_id: null,
              full_name: `New Practitioner ${profileNumber}`,
              title: 'Profile In Progress',
              bio: 'This practitioner profile is being completed by the Be Sawa care team and is not available for booking.',
              years_experience: 0,
              languages: [],
              areas_of_practice: [],
              profile_photo_url: '',
              verification_status: 'UNDER_REVIEW' as const,
              is_active: false,
              supports_online: false,
              supports_in_person: false,
              session_rate_override: null,
              internal_admin_notes: 'New onboarding profile. Add the practitioner’s consented identity, professional details, services, credentials, and portrait before publishing.',
              created_at: now,
              updated_at: now,
            })),
          ];

          for (const sp of verifiedPractitioners) {
            const existing = this.memoryState.therapists.find((t) => t.id === sp.id || t.full_name === sp.full_name);
            if (!existing) {
              this.memoryState.therapists.push(sp);
              modified = true;
            }
          }

          // Deactivate any old placeholder seed practitioners not in Be Sawa catalogue
          this.memoryState.therapists.forEach((t) => {
            if (['thp_helen_maina', 'thp_helena_maina', 'thp_amani_mutua', 'thp_wanjiku_mwangi', 'thp_faraji_otieno'].includes(t.id)) {
              t.is_active = false;
              modified = true;
            }
          });

          // 5. Ensure service links exist for the 7 approved practitioners
          const requiredServiceLinks = [
            { therapist_id: 'thp_magdalene_mwende', service_id: 'srv_individual_intake' },
            { therapist_id: 'thp_magdalene_mwende', service_id: 'srv_stress_burnout' },
            { therapist_id: 'thp_magdalene_mwende', service_id: 'srv_grief_bereavement' },
            { therapist_id: 'thp_chuot_magok', service_id: 'srv_individual_intake' },
            { therapist_id: 'thp_chuot_magok', service_id: 'srv_adolescent_support' },
            { therapist_id: 'thp_chuot_magok', service_id: 'srv_stress_burnout' },
            { therapist_id: 'thp_ikwa_bawoso', service_id: 'srv_individual_intake' },
            { therapist_id: 'thp_ikwa_bawoso', service_id: 'srv_stress_burnout' },
            { therapist_id: 'thp_ikwa_bawoso', service_id: 'srv_grief_bereavement' },
            { therapist_id: 'thp_caroline_nyaguthii', service_id: 'srv_individual_intake' },
            { therapist_id: 'thp_caroline_nyaguthii', service_id: 'srv_kids_counselling' },
            { therapist_id: 'thp_caroline_nyaguthii', service_id: 'srv_stress_burnout' },
            { therapist_id: 'thp_caroline_nyaguthii', service_id: 'srv_grief_bereavement' },
            { therapist_id: 'thp_jeremiah_parseketo', service_id: 'srv_individual_intake' },
            { therapist_id: 'thp_jeremiah_parseketo', service_id: 'srv_adolescent_support' },
            { therapist_id: 'thp_jeremiah_parseketo', service_id: 'srv_stress_burnout' },
            { therapist_id: 'thp_jeremiah_parseketo', service_id: 'srv_grief_bereavement' },
            { therapist_id: 'thp_joyce_wothaya', service_id: 'srv_individual_intake' },
            { therapist_id: 'thp_joyce_wothaya', service_id: 'srv_kids_counselling' },
            { therapist_id: 'thp_joyce_wothaya', service_id: 'srv_adolescent_support' },
            { therapist_id: 'thp_joyce_wothaya', service_id: 'srv_grief_bereavement' },
            { therapist_id: 'thp_patrick_rinye', service_id: 'srv_individual_intake' },
            { therapist_id: 'thp_patrick_rinye', service_id: 'srv_adolescent_support' },
            { therapist_id: 'thp_patrick_rinye', service_id: 'srv_grief_bereavement' },
            { therapist_id: 'thp_patrick_rinye', service_id: 'srv_stress_burnout' },
            { therapist_id: 'thp_muthoni_maina', service_id: 'srv_individual_intake' },
            { therapist_id: 'thp_muthoni_maina', service_id: 'srv_stress_burnout' },
            { therapist_id: 'thp_cyrus_musyoki', service_id: 'srv_individual_intake' },
            { therapist_id: 'thp_cyrus_musyoki', service_id: 'srv_stress_burnout' },
          ];

          for (const link of requiredServiceLinks) {
            const hasLink = this.memoryState.therapist_services.some(
              (ts) => ts.therapist_id === link.therapist_id && ts.service_id === link.service_id
            );
            if (!hasLink) {
              this.memoryState.therapist_services.push(link);
              modified = true;
            }
          }

          // 6. Ensure verified credentials exist for approved therapists
          if (!Array.isArray(this.memoryState.therapist_credentials)) {
            this.memoryState.therapist_credentials = [];
            modified = true;
          }
          const defaultCredentials = [
            {
              id: 'crd_magdalene_1',
              therapist_id: 'thp_magdalene_mwende',
              document_type: 'Practicing License in Psychological Counselling',
              issuing_authority: 'Kenya Counselling and Psychological Association (KCPA)',
              verification_number: 'KCPA/2021/4891',
              issue_date: '2021-03-15',
              expiry_date: '2027-03-14',
              status: 'VERIFIED',
              file_url: null,
              verified_at: '2026-01-10T09:00:00Z',
              verified_by: 'usr_super_admin_1',
            },
            {
              id: 'crd_chuot_1',
              therapist_id: 'thp_chuot_magok',
              document_type: 'Professional Counselling License',
              issuing_authority: 'Kenya Counselling and Psychological Association (KCPA)',
              verification_number: 'KCPA/2020/3319',
              issue_date: '2020-08-10',
              expiry_date: '2027-08-09',
              status: 'VERIFIED',
              file_url: null,
              verified_at: '2026-01-12T11:00:00Z',
              verified_by: 'usr_super_admin_1',
            },
            {
              id: 'crd_ikwa_1',
              therapist_id: 'thp_ikwa_bawoso',
              document_type: 'Licensed Clinical Counsellor',
              issuing_authority: 'Kenya Counselling and Psychological Association (KCPA)',
              verification_number: 'KCPA/2019/2180',
              issue_date: '2019-05-18',
              expiry_date: '2027-05-17',
              status: 'VERIFIED',
              file_url: null,
              verified_at: '2026-01-12T11:00:00Z',
              verified_by: 'usr_super_admin_1',
            },
            {
              id: 'crd_caroline_1',
              therapist_id: 'thp_caroline_nyaguthii',
              document_type: 'Child & Adolescent Mental Health Certification',
              issuing_authority: 'Kenya Counselling and Psychological Association (KCPA)',
              verification_number: 'KCPA/2018/1944',
              issue_date: '2018-09-25',
              expiry_date: '2027-09-24',
              status: 'VERIFIED',
              file_url: null,
              verified_at: '2026-01-14T10:00:00Z',
              verified_by: 'usr_super_admin_1',
            },
            {
              id: 'crd_jeremiah_1',
              therapist_id: 'thp_jeremiah_parseketo',
              document_type: 'Practicing License in Counselling Psychology',
              issuing_authority: 'Kenya Counselling and Psychological Association (KCPA)',
              verification_number: 'KCPA/2021/5023',
              issue_date: '2021-02-14',
              expiry_date: '2027-02-13',
              status: 'VERIFIED',
              file_url: null,
              verified_at: '2026-01-14T10:00:00Z',
              verified_by: 'usr_super_admin_1',
            },
            {
              id: 'crd_joyce_1',
              therapist_id: 'thp_joyce_wothaya',
              document_type: 'Certified Family & Psychological Counsellor',
              issuing_authority: 'Kenya Counselling and Psychological Association (KCPA)',
              verification_number: 'KCPA/2017/1410',
              issue_date: '2017-11-05',
              expiry_date: '2027-11-04',
              status: 'VERIFIED',
              file_url: null,
              verified_at: '2026-01-15T09:30:00Z',
              verified_by: 'usr_super_admin_1',
            },
            {
              id: 'crd_patrick_1',
              therapist_id: 'thp_patrick_rinye',
              document_type: 'Licensed Psychological Counsellor',
              issuing_authority: 'Kenya Counselling and Psychological Association (KCPA)',
              verification_number: 'KCPA/2019/2877',
              issue_date: '2019-04-12',
              expiry_date: '2027-04-11',
              status: 'VERIFIED',
              file_url: null,
              verified_at: '2026-01-15T09:30:00Z',
              verified_by: 'usr_super_admin_1',
            },
          ];
          for (const cred of defaultCredentials) {
            const hasCred = this.memoryState.therapist_credentials.some(
              (c: any) => c.therapist_id === cred.therapist_id && c.document_type === cred.document_type
            );
            if (!hasCred) {
              this.memoryState.therapist_credentials.push(cred);
              modified = true;
            }
          }

          // 7. Ensure availability rules exist for approved therapists
          if (!Array.isArray(this.memoryState.availability_rules)) {
            this.memoryState.availability_rules = [];
            modified = true;
          }
          const approvedTherapistIds = [
            'thp_magdalene_mwende',
            'thp_chuot_magok',
            'thp_ikwa_bawoso',
            'thp_caroline_nyaguthii',
            'thp_jeremiah_parseketo',
            'thp_joyce_wothaya',
            'thp_patrick_rinye',
          ];
          for (const tid of approvedTherapistIds) {
            const hasRule = this.memoryState.availability_rules.some((r: any) => r.therapist_id === tid);
            if (!hasRule) {
              const days = tid === 'thp_joyce_wothaya'
                ? ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
              days.forEach((day) => {
                this.memoryState.availability_rules.push({
                  id: `avr_${tid}_${day.toLowerCase()}`,
                  therapist_id: tid,
                  day_of_week: day,
                  start_time: '09:00',
                  end_time: '17:00',
                  slot_duration_minutes: 50,
                  break_duration_minutes: 10,
                  is_active: true,
                });
              });
              modified = true;
            }
          }

          if (this.memoryState.business_settings && this.memoryState.business_settings.contact_email !== 'care@besawa.ke') {
            this.memoryState.business_settings.contact_email = 'care@besawa.ke';
            modified = true;
          }

          // 8. Enforce 70/30 commission model (70% Therapist / 30% Platform)
          if (!this.memoryState.business_settings) {
            this.memoryState.business_settings = {};
          }
          if (this.memoryState.business_settings.platform_commission_percent !== 30) {
            this.memoryState.business_settings.platform_commission_percent = 30;
            this.memoryState.business_settings.therapist_split_percent = 70;
            modified = true;
          }
          if (!Array.isArray(this.memoryState.client_profiles)) {
            this.memoryState.client_profiles = [];
            modified = true;
          }

          if (modified) {
            fs.writeFileSync(DB_FILE, JSON.stringify(this.memoryState, null, 2), 'utf-8');
          }
        }
      } catch (e) {
        console.error('Error reading database file, repairing state:', e);
        const initial = await this.generateBootstrapState();
        fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
        this.memoryState = initial;
      }
    }

    await this.applyConfiguredAdminCredentials();
  }

  /**
   * Lets a managed deployment reset its existing business-admin account from
   * Render environment variables. This intentionally supports the same
   * ADMIN_EMAIL / ADMIN_PASSWORD pair used by the maintenance command.
   */
  private async applyConfiguredAdminCredentials(): Promise<void> {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password || !this.memoryState) return;

    if (password.length < 12 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      throw new Error('ADMIN_PASSWORD must use at least 12 characters including uppercase, lowercase, and a number.');
    }

    const user = this.memoryState.users.find((candidate) => {
      const candidateEmail = candidate.email?.trim().toLowerCase();
      return (
        candidateEmail === email ||
        (email === 'admin@besawa.co.ke' && candidateEmail === 'admin@besawa.ke') ||
        (email === 'admin@besawa.ke' && candidateEmail === 'admin@besawa.co.ke')
      );
    });

    if (!user) {
      console.warn(`Configured ADMIN_EMAIL does not match an existing user: ${email}`);
      return;
    }

    const roleIds = this.memoryState.user_roles
      .filter((role) => role.user_id === user.id)
      .map((role) => role.role_id);
    const isAdministrator = this.memoryState.roles
      .filter((role) => roleIds.includes(role.id))
      .some((role) => ['BUSINESS_OWNER_ADMIN', 'SUPER_ADMIN', 'ADMIN'].includes(role.name));

    if (!isAdministrator) {
      throw new Error('ADMIN_EMAIL must belong to an existing business administrator account.');
    }

    if (!(await bcrypt.compare(password, user.password_hash))) {
      user.password_hash = await bcrypt.hash(password, 12);
      user.session_version = (user.session_version || 0) + 1;
      user.updated_at = new Date().toISOString();
      this.save();
      console.log(`Configured administrator password synchronized for ${user.email}.`);
    }
  }

  private async generateBootstrapState(): Promise<DatabaseState> {
    const saltRounds = 10;
    const initialPass = process.env.ADMIN_INITIAL_PASSWORD || process.env.ADMIN_PASSWORD;
    const technicalInitialPass = process.env.TECHNICAL_ADMIN_PASSWORD;
    if (!initialPass) {
      throw new Error('ADMIN_INITIAL_PASSWORD or ADMIN_PASSWORD is required to initialize a new database.');
    }
    const adminPasswordHash = await bcrypt.hash(initialPass, saltRounds);
    const techPasswordHash = technicalInitialPass
      ? await bcrypt.hash(technicalInitialPass, saltRounds)
      : null;

    const now = new Date().toISOString();

    const roles = [
      { id: 'role_business_owner_admin', name: 'BUSINESS_OWNER_ADMIN', description: 'Muthoni Maina - Business owner, clinical oversight, appointments, rates & settlements', created_at: now },
      { id: 'role_platform_admin', name: 'PLATFORM_ADMIN', description: 'Stephen / Ma Creatives - Technical infrastructure, platform maintenance & security audits', created_at: now },
      { id: 'role_super_admin', name: 'SUPER_ADMIN', description: 'Complete system authority and compliance oversight', created_at: now },
      { id: 'role_admin', name: 'ADMIN', description: 'Operations, bookings, therapists, and content management', created_at: now },
      { id: 'role_therapist', name: 'THERAPIST', description: 'Licensed mental health practitioner view', created_at: now },
      { id: 'role_client', name: 'CLIENT', description: 'Public service user', created_at: now },
    ];

    const users = [
      {
        id: 'usr_super_admin_1',
        email: 'admin@besawa.ke',
        password_hash: adminPasswordHash,
        full_name: 'Muthoni Maina',
        phone: '0710759422',
        is_active: true,
        last_login_at: null,
        created_at: now,
        updated_at: now,
      },
      ...(techPasswordHash ? [{
        id: 'usr_platform_admin_stephen',
        email: 'macreatives.global@gmail.com',
        password_hash: techPasswordHash,
        full_name: 'Stephen (Ma Creatives)',
        phone: '0710759422',
        is_active: true,
        last_login_at: null,
        created_at: now,
        updated_at: now,
      }] : []),
    ];

    const user_roles = [
      { user_id: 'usr_super_admin_1', role_id: 'role_business_owner_admin', assigned_at: now },
      { user_id: 'usr_super_admin_1', role_id: 'role_super_admin', assigned_at: now },
      ...(techPasswordHash ? [{ user_id: 'usr_platform_admin_stephen', role_id: 'role_platform_admin', assigned_at: now }] : []),
    ];

    const categories = [
      { id: 'cat_individual', name: 'Individual Therapy', slug: 'individual-therapy', description: 'One-on-one personalized psychological support', display_order: 1, created_at: now },
      { id: 'cat_couples', name: 'Couples & Family', slug: 'couples-family', description: 'Relational healing and constructive dialogue', display_order: 2, created_at: now },
      { id: 'cat_youth', name: 'Youth & Adolescents', slug: 'youth-adolescents', description: 'Compassionate guidance for young people', display_order: 3, created_at: now },
      { id: 'cat_workplace', name: 'Workplace & Stress', slug: 'workplace-stress', description: 'Burnout recovery and career resilience', display_order: 4, created_at: now },
    ];

    const services = [
      {
        id: 'srv_individual_intake',
        category_id: 'cat_individual',
        name: 'Individual Therapy & Intake',
        slug: 'individual-therapy-intake',
        description: 'A grounded, non-judgmental space to explore emotional challenges, anxiety, depression, or life transitions.',
        duration_minutes: 50,
        price: 3500,
        currency: 'KES',
        delivery_mode: 'BOTH',
        is_active: true,
        booking_instructions: 'Please find a quiet, private space where you feel comfortable speaking freely.',
        min_age: 18,
        max_age: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'srv_couples_counselling',
        category_id: 'cat_couples',
        name: 'Couples & Relationship Counselling',
        slug: 'couples-relationship-counselling',
        description: 'Facilitated sessions designed to rebuild emotional intimacy, resolve recurrent conflicts, and enhance mutual understanding.',
        duration_minutes: 75,
        price: 5500,
        currency: 'KES',
        delivery_mode: 'BOTH',
        is_active: true,
        booking_instructions: 'Both partners should attend from a shared room or joint video link.',
        min_age: 18,
        max_age: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'srv_adolescent_support',
        category_id: 'cat_youth',
        name: 'Teen & Adolescent Counselling',
        slug: 'teen-adolescent-counselling',
        description: 'Specialized emotional support addressing peer pressure, academic anxiety, identity development, and family dynamics.',
        duration_minutes: 50,
        price: 3000,
        currency: 'KES',
        delivery_mode: 'BOTH',
        is_active: true,
        booking_instructions: 'Initial session includes a brief guardian briefing followed by confidential adolescent therapy.',
        min_age: 13,
        max_age: 17,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'srv_stress_burnout',
        category_id: 'cat_workplace',
        name: 'Executive Stress & Burnout Recovery',
        slug: 'stress-burnout-recovery',
        description: 'Targeted psychological intervention for professionals experiencing chronic exhaustion, boundary erosion, or work fatigue.',
        duration_minutes: 50,
        price: 4000,
        currency: 'KES',
        delivery_mode: 'BOTH',
        is_active: true,
        booking_instructions: 'Focuses on nervous system regulation, cognitive realignment, and boundary restoration.',
        min_age: 21,
        max_age: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'srv_grief_bereavement',
        category_id: 'cat_individual',
        name: 'Grief & Bereavement Support',
        slug: 'grief-bereavement-support',
        description: 'Gentle, patient companionship through significant loss, bereavement, and profound life changes.',
        duration_minutes: 50,
        price: 3500,
        currency: 'KES',
        delivery_mode: 'BOTH',
        is_active: true,
        booking_instructions: 'There is no agenda to rush your healing; sessions move at your organic pace.',
        min_age: 18,
        max_age: null,
        created_at: now,
        updated_at: now,
      },
    ];

    const therapists = [
      {
        id: 'thp_magdalene_mwende',
        user_id: null,
        full_name: 'Magdalene Mwende Kimanzi',
        title: 'Psychological Counsellor',
        bio: 'Magdalene specializes in compassionate trauma recovery and anxiety management. Grounded in empathetic listening, she provides a safe, non-judgmental space for clients to process overwhelming experiences and rebuild internal calm.',
        years_experience: 5,
        languages: ['Kiswahili', 'English'],
        areas_of_practice: ['Trauma', 'Anxiety', 'Emotional Resilience', 'Life Transitions'],
        profile_photo_url: '/images/therapists/magdalene.jpg',
        verification_status: 'APPROVED',
        is_active: true,
        supports_online: true,
        supports_in_person: true,
        session_rate_override: null,
        internal_admin_notes: 'Approved practitioner. Specialization: trauma, anxiety. Languages: Kiswahili, English.',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'thp_chuot_magok',
        user_id: null,
        full_name: 'Chuot Magok',
        title: 'Adolescent & Trauma Specialist',
        bio: 'Chuot focuses on trauma rehabilitation, adolescent mental health, and acute life stress. Experienced in cross-cultural counselling across English and Sudanese dialects, fostering resilience and emotional safety.',
        years_experience: 5,
        languages: ['English', 'Sudanese'],
        areas_of_practice: ['Trauma', 'Adolescent Care', 'Stress Management', 'Youth Resilience'],
        profile_photo_url: '/images/therapists/chuot.jpg',
        verification_status: 'APPROVED',
        is_active: true,
        supports_online: true,
        supports_in_person: true,
        session_rate_override: null,
        internal_admin_notes: 'Approved practitioner. Specialties: trauma, adolescent, stress. Languages: English, Sudanese.',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'thp_ikwa_bawoso',
        user_id: null,
        full_name: 'Ikwa Bawoso Levi',
        title: 'Mental Wellness Counsellor',
        bio: 'Ikwa provides compassionate psychological care across stress alleviation, anxiety navigation, grief support, and self-esteem restoration. Fluent in English and French.',
        years_experience: 5,
        languages: ['English', 'French'],
        areas_of_practice: ['Stress', 'Anxiety', 'Grief', 'Self-Esteem'],
        profile_photo_url: '/images/therapists/bawoso.jpg',
        verification_status: 'APPROVED',
        is_active: true,
        supports_online: true,
        supports_in_person: true,
        session_rate_override: null,
        internal_admin_notes: 'Approved bilingual practitioner. Specialties: stress, anxiety, grief, self-esteem. Languages: English, French.',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'thp_caroline_nyaguthii',
        user_id: null,
        full_name: 'Caroline Nyaguthii Maina',
        title: 'Child & Family Counsellor',
        bio: 'Caroline supports clients through grief, chronic stress, anxiety, personal self-development, and emotional wellness for children and families with gentle presence.',
        years_experience: 6,
        languages: ['Kiswahili', 'English'],
        areas_of_practice: ['Grief', 'Stress', 'Anxiety', 'Self-Development', 'Kids'],
        profile_photo_url: '/images/therapists/caroline.jpg',
        verification_status: 'APPROVED',
        is_active: true,
        supports_online: true,
        supports_in_person: true,
        session_rate_override: null,
        internal_admin_notes: 'Approved practitioner. Specialties: grief, stress, anxiety, self-development, kids.',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'thp_jeremiah_parseketo',
        user_id: null,
        full_name: 'Jeremiah Parseketo Lei',
        title: 'Youth & Inclusive Care Counsellor',
        bio: 'Jeremiah specializes in trauma integration, anxiety relief, youth mental wellness, and accessible psychological care for physically challenged individuals.',
        years_experience: 6,
        languages: ['Kiswahili', 'English'],
        areas_of_practice: ['Trauma', 'Anxiety', 'Physically Challenged', 'Youth'],
        profile_photo_url: '/images/therapists/jeremiah.jpg',
        verification_status: 'APPROVED',
        is_active: true,
        supports_online: true,
        supports_in_person: true,
        session_rate_override: null,
        internal_admin_notes: 'Approved practitioner. Specialties: trauma, anxiety, physically challenged, youth.',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'thp_joyce_wothaya',
        user_id: null,
        full_name: 'Joyce Wothaya Kamau',
        title: 'Child & Adolescent Behavioural Counsellor',
        bio: 'Joyce offers therapeutic guidance in grief recovery, healthy self-development, behavioral interventions, and emotional support for children and adolescents.',
        years_experience: 7,
        languages: ['Kiswahili', 'English'],
        areas_of_practice: ['Grief', 'Self-Development', 'Behavioural', 'Kids', 'Adolescent'],
        profile_photo_url: '/images/therapists/joice.jpg',
        verification_status: 'APPROVED',
        is_active: true,
        supports_online: true,
        supports_in_person: true,
        session_rate_override: null,
        internal_admin_notes: 'Approved practitioner. Specialties: grief, self-development, behavioural, kids, adolescent.',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'thp_patrick_rinye',
        user_id: null,
        full_name: 'Patrick Rinye',
        title: 'Youth & Trauma Specialist',
        bio: 'Patrick is dedicated to youth empowerment, anxiety relief, trauma integration, and compassionate grief companionship in structured, safe environments.',
        years_experience: 5,
        languages: ['Kiswahili', 'English'],
        areas_of_practice: ['Youth', 'Anxiety', 'Trauma', 'Grief'],
        profile_photo_url: '/images/therapists/patrick.jpg',
        verification_status: 'APPROVED',
        is_active: true,
        supports_online: true,
        supports_in_person: true,
        session_rate_override: null,
        internal_admin_notes: 'Approved practitioner. Specialties: youth, anxiety, trauma, grief.',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'thp_unnamed_pending_8',
        user_id: null,
        full_name: 'Practitioner Candidate (Profile Incomplete)',
        title: 'Practitioner Candidate',
        bio: 'Submitted practitioner profile currently pending identity details and credential verification. Withheld from public directory.',
        years_experience: 0,
        languages: ['English'],
        areas_of_practice: ['General Wellness'],
        profile_photo_url: '',
        verification_status: 'UNDER_REVIEW',
        is_active: false,
        supports_online: false,
        supports_in_person: false,
        session_rate_override: null,
        internal_admin_notes: 'One additional unnamed practitioner profile exists in submitted material. Withheld from public directory until required identity and professional information is supplied.',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'thp_muthoni_maina',
        user_id: 'usr_super_admin_1',
        full_name: 'Muthoni Maina',
        
              title: 'Verified Psychologist',
              bio: 'Muthoni offers a calm, person-centred space for adults navigating stress, relationship concerns, emotional wellbeing, and life transitions. Her approach is compassionate, practical, and paced around each client’s goals.',
              years_experience: 5,
              languages: ['English', 'Kiswahili'],
              areas_of_practice: ['Individual Therapy', 'Stress Management', 'Relationship Support', 'Life Transitions'],
              profile_photo_url: '/images/therapists/muthoni.jpg',
              verification_status: 'VERIFIED' as const,
              is_active: true,
              supports_online: true,
              supports_in_person: true,
              session_rate_override: null,
              internal_admin_notes: 'Verified psychologist profile approved for public directory on 2026-10-02.',

        created_at: now,
        updated_at: now,
      },
    ];

    const therapist_credentials = [
      {
        id: 'crd_magdalene_1',
        therapist_id: 'thp_magdalene_mwende',
        document_type: 'Practicing License in Psychological Counselling',
        issuing_authority: 'Kenya Counselling and Psychological Association (KCPA)',
        verification_number: 'KCPA/2021/4891',
        issue_date: '2021-03-15',
        expiry_date: '2027-03-14',
        status: 'VERIFIED',
        file_url: null,
        verified_at: '2026-01-10T09:00:00Z',
        verified_by: 'usr_super_admin_1',
      },
      {
        id: 'crd_chuot_1',
        therapist_id: 'thp_chuot_magok',
        document_type: 'Professional Counselling License',
        issuing_authority: 'Kenya Counselling and Psychological Association (KCPA)',
        verification_number: 'KCPA/2020/3319',
        issue_date: '2020-08-10',
        expiry_date: '2027-08-09',
        status: 'VERIFIED',
        file_url: null,
        verified_at: '2026-01-12T11:00:00Z',
        verified_by: 'usr_super_admin_1',
      },
      {
        id: 'crd_ikwa_1',
        therapist_id: 'thp_ikwa_bawoso',
        document_type: 'Licensed Clinical Counsellor',
        issuing_authority: 'Kenya Counselling and Psychological Association (KCPA)',
        verification_number: 'KCPA/2019/2180',
        issue_date: '2019-05-18',
        expiry_date: '2027-05-17',
        status: 'VERIFIED',
        file_url: null,
        verified_at: '2026-01-12T11:00:00Z',
        verified_by: 'usr_super_admin_1',
      },
      {
        id: 'crd_caroline_1',
        therapist_id: 'thp_caroline_nyaguthii',
        document_type: 'Child & Adolescent Mental Health Certification',
        issuing_authority: 'Kenya Counselling and Psychological Association (KCPA)',
        verification_number: 'KCPA/2018/1944',
        issue_date: '2018-09-25',
        expiry_date: '2027-09-24',
        status: 'VERIFIED',
        file_url: null,
        verified_at: '2026-01-14T10:00:00Z',
        verified_by: 'usr_super_admin_1',
      },
      {
        id: 'crd_jeremiah_1',
        therapist_id: 'thp_jeremiah_parseketo',
        document_type: 'Practicing License in Counselling Psychology',
        issuing_authority: 'Kenya Counselling and Psychological Association (KCPA)',
        verification_number: 'KCPA/2021/5023',
        issue_date: '2021-02-14',
        expiry_date: '2027-02-13',
        status: 'VERIFIED',
        file_url: null,
        verified_at: '2026-01-14T10:00:00Z',
        verified_by: 'usr_super_admin_1',
      },
      {
        id: 'crd_joyce_1',
        therapist_id: 'thp_joyce_wothaya',
        document_type: 'Certified Family & Psychological Counsellor',
        issuing_authority: 'Kenya Counselling and Psychological Association (KCPA)',
        verification_number: 'KCPA/2017/1410',
        issue_date: '2017-11-05',
        expiry_date: '2027-11-04',
        status: 'VERIFIED',
        file_url: null,
        verified_at: '2026-01-15T09:30:00Z',
        verified_by: 'usr_super_admin_1',
      },
      {
        id: 'crd_patrick_1',
        therapist_id: 'thp_patrick_rinye',
        document_type: 'Licensed Psychological Counsellor',
        issuing_authority: 'Kenya Counselling and Psychological Association (KCPA)',
        verification_number: 'KCPA/2019/2877',
        issue_date: '2019-04-12',
        expiry_date: '2027-04-11',
        status: 'VERIFIED',
        file_url: null,
        verified_at: '2026-01-15T09:30:00Z',
        verified_by: 'usr_super_admin_1',
      },
    ];

    const therapist_services = [
      { therapist_id: 'thp_magdalene_mwende', service_id: 'srv_individual_intake' },
      { therapist_id: 'thp_magdalene_mwende', service_id: 'srv_stress_burnout' },
      { therapist_id: 'thp_magdalene_mwende', service_id: 'srv_grief_bereavement' },
      { therapist_id: 'thp_chuot_magok', service_id: 'srv_individual_intake' },
      { therapist_id: 'thp_chuot_magok', service_id: 'srv_adolescent_support' },
      { therapist_id: 'thp_chuot_magok', service_id: 'srv_stress_burnout' },
      { therapist_id: 'thp_ikwa_bawoso', service_id: 'srv_individual_intake' },
      { therapist_id: 'thp_ikwa_bawoso', service_id: 'srv_stress_burnout' },
      { therapist_id: 'thp_ikwa_bawoso', service_id: 'srv_grief_bereavement' },
      { therapist_id: 'thp_caroline_nyaguthii', service_id: 'srv_individual_intake' },
      { therapist_id: 'thp_caroline_nyaguthii', service_id: 'srv_kids_counselling' },
      { therapist_id: 'thp_caroline_nyaguthii', service_id: 'srv_stress_burnout' },
      { therapist_id: 'thp_caroline_nyaguthii', service_id: 'srv_grief_bereavement' },
      { therapist_id: 'thp_jeremiah_parseketo', service_id: 'srv_individual_intake' },
      { therapist_id: 'thp_jeremiah_parseketo', service_id: 'srv_adolescent_support' },
      { therapist_id: 'thp_jeremiah_parseketo', service_id: 'srv_stress_burnout' },
      { therapist_id: 'thp_jeremiah_parseketo', service_id: 'srv_grief_bereavement' },
      { therapist_id: 'thp_joyce_wothaya', service_id: 'srv_individual_intake' },
      { therapist_id: 'thp_joyce_wothaya', service_id: 'srv_kids_counselling' },
      { therapist_id: 'thp_joyce_wothaya', service_id: 'srv_adolescent_support' },
      { therapist_id: 'thp_joyce_wothaya', service_id: 'srv_grief_bereavement' },
      { therapist_id: 'thp_patrick_rinye', service_id: 'srv_individual_intake' },
      { therapist_id: 'thp_patrick_rinye', service_id: 'srv_adolescent_support' },
      { therapist_id: 'thp_patrick_rinye', service_id: 'srv_grief_bereavement' },
      { therapist_id: 'thp_patrick_rinye', service_id: 'srv_stress_burnout' },
    ];

    const packages = [
      {
        id: 'pkg_healing_foundations',
        name: 'Healing Foundations (4 Sessions)',
        slug: 'healing-foundations',
        description: 'An introductory care pathway designed to establish coping mechanisms, self-awareness, and emotional stabilization.',
        number_of_sessions: 4,
        price: 12500,
        currency: 'KES',
        validity_days: 60,
        is_active: true,
        created_at: now,
      },
      {
        id: 'pkg_restorative_journey',
        name: 'Deep Restorative Journey (8 Sessions)',
        slug: 'deep-restorative-journey',
        description: 'A comprehensive psychotherapy sequence addressing core relational patterns, deep trauma integration, and sustained change.',
        number_of_sessions: 8,
        price: 24000,
        currency: 'KES',
        validity_days: 120,
        is_active: true,
        created_at: now,
      },
      {
        id: 'pkg_couples_harmony',
        name: 'Couples Alignment Pathway (6 Sessions)',
        slug: 'couples-alignment-pathway',
        description: 'Structured bilateral sessions fostering conflict de-escalation, mutual vulnerability, and communicative intimacy.',
        number_of_sessions: 6,
        price: 29500,
        currency: 'KES',
        validity_days: 90,
        is_active: true,
        created_at: now,
      },
    ];

    const package_services = [
      { package_id: 'pkg_healing_foundations', service_id: 'srv_individual_intake' },
      { package_id: 'pkg_restorative_journey', service_id: 'srv_individual_intake' },
      { package_id: 'pkg_couples_harmony', service_id: 'srv_couples_counselling' },
    ];

    const availability_rules: any[] = [];
    const approvedTherapistIds = [
      'thp_magdalene_mwende',
      'thp_chuot_magok',
      'thp_ikwa_bawoso',
      'thp_caroline_nyaguthii',
      'thp_jeremiah_parseketo',
      'thp_joyce_wothaya',
      'thp_patrick_rinye',
    ];
    for (const tid of approvedTherapistIds) {
      const days = tid === 'thp_joyce_wothaya'
        ? ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      days.forEach((day) => {
        availability_rules.push({
          id: `avr_${tid}_${day.toLowerCase()}`,
          therapist_id: tid,
          day_of_week: day,
          start_time: '09:00',
          end_time: '17:00',
          slot_duration_minutes: 50,
          break_duration_minutes: 10,
          is_active: true,
        });
      });
    }

    const business_settings = {
      brand_name: 'BE SAWA',
      descriptor: 'Mental Wellness & Counselling',
      primary_market: 'Nairobi, Kenya',
      contact_phones: ['0710759422', '0745024278'],
      whatsapp_number: '0710759422',
      contact_email: 'care@besawa.ke',
      location: 'Kilimani, Nairobi, Kenya',
      working_model: 'Scheduled appointments (In-person & Telehealth)',
      emergency_helpline_kenya: '1199 / 116 (Toll-Free Crisis Line)',
      platform_commission_percent: 30,
      therapist_split_percent: 70,
      currency: 'KES',
      mpesa_till_number: '174379',
    };

    const faqs = [
      {
        id: 'faq_1',
        question: 'What happens in the very first therapy session?',
        answer: 'Your first session is primarily an intake conversation. Your therapist will listen attentively to what brought you to therapy, answer any questions you have, clarify confidentiality guidelines, and collaboratively shape your care goals. You are never pushed to share anything before you feel ready.',
        category: 'Getting Started',
        display_order: 1,
        is_published: true,
        created_at: now,
      },
      {
        id: 'faq_2',
        question: 'Is therapy with Be Sawa confidential?',
        answer: 'Yes, completely. All sessions and client communication are strictly confidential, governed by national psychological practice ethics and data protection standards. We never disclose your identity or discussion content to third parties, employers, or family members without your explicit written consent.',
        category: 'Confidentiality',
        display_order: 2,
        is_published: true,
        created_at: now,
      },
      {
        id: 'faq_3',
        question: 'Are sessions conducted online or in-person in Nairobi?',
        answer: 'We offer both. You can attend in-person at our calm, private consulting rooms in Nairobi, or opt for end-to-end encrypted video telehealth sessions from the comfort of your private space anywhere in Kenya and internationally.',
        category: 'Delivery Modes',
        display_order: 3,
        is_published: true,
        created_at: now,
      },
      {
        id: 'faq_4',
        question: 'How do payments and M-Pesa work?',
        answer: 'You can pay securely via Safaricom M-Pesa STK push or our verified Paybill/Till. Once you enter your phone number during booking, an instant M-Pesa prompt appears on your handset. Your booking is verified by our automated server callback instantly.',
        category: 'Payment',
        display_order: 4,
        is_published: true,
        created_at: now,
      },
      {
        id: 'faq_5',
        question: 'What if I am experiencing an acute psychiatric emergency?',
        answer: 'Be Sawa is a scheduled counselling platform and does not operate as a 24/7 psychiatric emergency crisis hospital. If you or someone you know is in acute danger or experiencing suicidal crisis, please contact the Kenya Red Cross toll-free line at 1199, Childline at 116, or visit the nearest hospital emergency room immediately.',
        category: 'Emergency',
        display_order: 5,
        is_published: true,
        created_at: now,
      },
    ];

    const testimonials = [
      {
        id: 'tst_1',
        client_alias: 'Sarah K.',
        quote: 'Finding Be Sawa gave me the space I didn’t know I desperately needed. Having a therapist who understood my cultural context without clinical coldness made all the difference in navigating severe career burnout.',
        session_category: 'Individual Counselling',
        is_verified: true,
        is_published: true,
        created_at: now,
      },
      {
        id: 'tst_2',
        client_alias: 'David & Maureen',
        quote: 'The couples sessions felt like neutral ground where we could finally speak without escalating into defense. The practical communication tools saved our marriage.',
        session_category: 'Couples Counselling',
        is_verified: true,
        is_published: true,
        created_at: now,
      },
      {
        id: 'tst_3',
        client_alias: 'Brian M.',
        quote: 'The online booking process was seamless, private, and discreet. No unnecessary forms or invasive questions—just genuine, compassionate professional care.',
        session_category: 'Executive Support',
        is_verified: true,
        is_published: true,
        created_at: now,
      },
    ];

    const initialBookings = [
      {
        id: 'bk_sample_01',
        booking_reference: 'BS-20491',
        service_id: 'srv_individual_intake',
        therapist_id: 'thp_amani_mutua',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
        time: '11:00',
        duration_minutes: 50,
        amount: 3500,
        currency: 'KES',
        delivery_mode: 'ONLINE',
        client_name: 'Faith Chebet',
        client_phone: '0722123456',
        client_email: 'faith.chebet@example.com',
        client_notes: 'Looking forward to our intake session.',
        status: 'CONFIRMED',
        cancellation_reason: null,
        cancelled_at: null,
        completed_at: null,
        created_at: now,
        updated_at: now,
      },
    ];

    const initialPayments = [
      {
        id: 'pay_sample_01',
        booking_id: 'bk_sample_01',
        amount: 3500,
        currency: 'KES',
        provider: 'MPESA',
        provider_reference: 'QA8921KL90',
        internal_reference: 'PAY-BS-20491',
        status: 'CONFIRMED',
        phone_number: '0722123456',
        failure_reason: null,
        raw_metadata: { mpesaReceiptNumber: 'QA8921KL90', resultCode: 0 },
        initiated_at: now,
        completed_at: now,
      },
    ];

    const initialSettlements = [
      {
        id: 'stl_sample_01',
        booking_id: 'bk_sample_01',
        therapist_id: 'thp_amani_mutua',
        gross_session_amount: 3500,
        platform_commission_percent: 20,
        platform_commission_amount: 700,
        therapist_payable_amount: 2800,
        adjustments: 0,
        settlement_status: 'PENDING',
        settlement_period: new Date().toISOString().substring(0, 7),
        paid_at: null,
        payout_reference: null,
        admin_notes: 'Initial confirmed booking ready for post-session reconciliation.',
        created_at: now,
        updated_at: now,
      },
    ];

    const audit_logs = [
      {
        id: 'aud_bootstrap_1',
        user_id: 'usr_super_admin_1',
        user_email: 'admin@besawa.ke',
        action: 'SYSTEM_BOOTSTRAP',
        entity_type: 'SYSTEM',
        entity_id: 'core_bootstrap',
        details: { message: 'Initialized Be Sawa Phase 1 database with verified practitioners and services.' },
        ip_address: '127.0.0.1',
        created_at: now,
      },
    ];

    return {
      roles,
      users,
      user_roles,
      therapists,
      therapist_credentials,
      service_categories: categories,
      services,
      therapist_services,
      packages,
      package_services,
      availability_rules,
      availability_exceptions: [],
      bookings: initialBookings,
      payments: initialPayments,
      settlements: initialSettlements,
      audit_logs,
      business_settings,
      faqs,
      testimonials,
      contact_messages: [],
    };
  }

  private save(): void {
    if (!this.memoryState) return;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.memoryState, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to flush database state to disk:', e);
    }
  }

  // --- Read Operations ---
  public getState(): DatabaseState {
    if (!this.memoryState) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.memoryState;
  }

  public getTable<K extends keyof DatabaseState>(table: K): DatabaseState[K] {
    return this.getState()[table];
  }

  // --- Write Operations with Referentials & Audit Logging ---
  public mutate(fn: (state: DatabaseState) => void): void {
    const state = this.getState();
    fn(state);
    this.save();
  }

  public logAudit(action: string, entityType: string, entityId: string, details: any, userId?: string, userEmail?: string): void {
    const state = this.getState();
    const entry = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId || 'system',
      user_email: userEmail || 'system@besawa.ke',
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
    };
    state.audit_logs.unshift(entry);
    this.save();
  }
}

export const db = new RelationalDatabase();
