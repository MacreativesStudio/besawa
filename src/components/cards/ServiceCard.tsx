import React from 'react';
import { Clock, MapPin, Video, ArrowRight, Shield } from 'lucide-react';
import { Service } from '../../types';
import { Button } from '../common/Button';

interface ServiceCardProps {
  service: Service;
  onBook: (serviceId: string) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onBook }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E3DED6] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9E5D43] bg-[#F7EFEA] px-2.5 py-1 rounded-full">
            {service.category_name || 'Individual Care'}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-[#54635B]">
            {service.delivery_mode === 'ONLINE' && (
              <span className="flex items-center gap-1 text-[#2D5A46] font-medium">
                <Video className="w-3.5 h-3.5" /> Online
              </span>
            )}
            {service.delivery_mode === 'IN_PERSON' && (
              <span className="flex items-center gap-1 text-[#9E5D43] font-medium">
                <MapPin className="w-3.5 h-3.5" /> In-Person
              </span>
            )}
            {service.delivery_mode === 'BOTH' && (
              <span className="flex items-center gap-1 text-[#2D5A46] font-medium">
                <Video className="w-3.5 h-3.5" /> Online / <MapPin className="w-3.5 h-3.5" /> In-Person
              </span>
            )}
          </div>
        </div>

        <h3 className="text-lg font-bold text-[#1C2420] mb-2">{service.name}</h3>
        <p className="text-sm text-[#54635B] leading-relaxed mb-4 line-clamp-3">
          {service.description}
        </p>
      </div>

      <div className="pt-4 border-t border-[#EDE9E1] flex items-center justify-between mt-2">
        <div>
          <div className="text-xs text-[#78867E]">Standard Session ({service.duration_minutes}m)</div>
          <div className="text-lg font-bold text-[#1C2420]">
            {service.currency} {service.price.toLocaleString()}
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onBook(service.id)}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          Book
        </Button>
      </div>
    </div>
  );
};
