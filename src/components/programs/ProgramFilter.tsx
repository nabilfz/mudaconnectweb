import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export interface ProgramFilterState {
  search: string;
  category: string;
  deliveryMode: string;
  registrationStatus: string;
}

export interface ProgramFilterProps {
  filter: ProgramFilterState;
  onChange: (newFilter: ProgramFilterState) => void;
  onReset: () => void;
}

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'all', label: 'Semua Kategori' },
  { value: 'Pendidikan', label: 'Pendidikan' },
  { value: 'Keterampilan Digital', label: 'Keterampilan Digital' },
  { value: 'Kepemudaan', label: 'Kepemudaan' },
  { value: 'Sosial', label: 'Sosial' },
  { value: 'Kewirausahaan', label: 'Kewirausahaan' },
  { value: 'Pengembangan Diri', label: 'Pengembangan Diri' },
];

const DELIVERY_MODES: { value: string; label: string }[] = [
  { value: 'all', label: 'Semua Format' },
  { value: 'online', label: 'Daring' },
  { value: 'offline', label: 'Tatap muka' },
  { value: 'hybrid', label: 'Hybrid' },
];

const REG_STATUSES: { value: string; label: string }[] = [
  { value: 'all', label: 'Semua Status' },
  { value: 'interest_open', label: 'Form minat dibuka' },
  { value: 'coming_soon', label: 'Segera hadir' },
  { value: 'ongoing', label: 'Sedang berjalan' },
  { value: 'completed', label: 'Telah selesai' },
  { value: 'closed', label: 'Ditutup' },
];

export const ProgramFilter: React.FC<ProgramFilterProps> = ({ filter, onChange, onReset }) => {
  const isFiltered =
    filter.search !== '' ||
    filter.category !== 'all' ||
    filter.deliveryMode !== 'all' ||
    filter.registrationStatus !== 'all';

  return (
    <div className="space-y-4 border-y border-[#9fa29d] py-5">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#071f32]">
          <Filter className="h-3.5 w-3.5 text-[#007d6f]" aria-hidden="true" />
          Saring program
        </h3>
        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="flex cursor-pointer items-center gap-1 text-xs font-bold text-[#b94747] hover:underline"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" /> Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[1.25fr_1fr_1fr_1fr]">
        <Input
          placeholder="Cari nama atau deskripsi..."
          value={filter.search}
          onChange={(e) => onChange({ ...filter, search: e.target.value })}
          leftIcon={<Search className="h-4 w-4 text-[#617078]" />}
          className="rounded-none border-[#cfcac0] bg-[#fbfaf6]"
        />

        <Select
          options={CATEGORIES}
          value={filter.category}
          onChange={(e) => onChange({ ...filter, category: e.target.value })}
          className="rounded-none border-[#cfcac0] bg-[#fbfaf6]"
        />

        <Select
          options={DELIVERY_MODES}
          value={filter.deliveryMode}
          onChange={(e) => onChange({ ...filter, deliveryMode: e.target.value })}
          className="rounded-none border-[#cfcac0] bg-[#fbfaf6]"
        />

        <Select
          options={REG_STATUSES}
          value={filter.registrationStatus}
          onChange={(e) => onChange({ ...filter, registrationStatus: e.target.value })}
          className="rounded-none border-[#cfcac0] bg-[#fbfaf6]"
        />
      </div>
    </div>
  );
};
