import React, { useEffect, useRef } from 'react';

export const GOOGLE_CALENDAR_SCHEDULE_URL =
  'https://calendar.google.com/calendar/appointments/schedules/AcZssZ39jIFaE98TdoKnOmL7sOYtM0lQHu7F-hcQm5JU8nYfeCbtzoUAJ7lQXXO9hHxYW-9hvOMejMAm?gv=true';

interface GoogleCalendarButtonProps {
  label?: string;
  color?: string;
  className?: string;
}

export const GoogleCalendarButton: React.FC<GoogleCalendarButtonProps> = ({
  label = 'Agende sua consultoria',
  color = '#8E24AA',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;

    const mountOfficialButton = () => {
      if (cancelled || !container) return false;
      const cal = (window as any).calendar;
      if (cal?.schedulingButton?.load) {
        container.innerHTML = '';
        const target = document.createElement('span');
        target.style.display = 'none';
        container.appendChild(target);
        cal.schedulingButton.load({
          url: GOOGLE_CALENDAR_SCHEDULE_URL,
          color,
          label,
          target,
        });
        return true;
      }
      return false;
    };

    if (!mountOfficialButton()) {
      const interval = setInterval(() => {
        if (mountOfficialButton()) {
          clearInterval(interval);
        }
      }, 200);

      const handleLoad = () => {
        if (mountOfficialButton()) {
          clearInterval(interval);
        }
      };

      window.addEventListener('load', handleLoad);
      return () => {
        cancelled = true;
        clearInterval(interval);
        window.removeEventListener('load', handleLoad);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [label, color]);

  return (
    <div
      ref={containerRef}
      className={`inline-flex items-center justify-center ${className}`}
    >
      <a
        href={GOOGLE_CALENDAR_SCHEDULE_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{ backgroundColor: color }}
        className="px-6 py-3 rounded-xl text-white font-bold text-sm shadow-lg hover:opacity-90 transition-opacity inline-flex items-center justify-center"
      >
        {label}
      </a>
    </div>
  );
};

export default GoogleCalendarButton;
