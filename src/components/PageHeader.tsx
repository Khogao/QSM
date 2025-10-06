import { SettingsDialog } from './SettingsDialog';

interface PageHeaderProps {
  title?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title = 'QSM - QueryMaster' }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <SettingsDialog />
      </div>
    </header>
  );
};
