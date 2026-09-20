import { useState } from 'react';
import {
  ArrowDownUpIcon,
  ArrowRightIcon,
  MapPinIcon,
  NavigationIcon,
  UsersIcon } from
'lucide-react';
import { Button } from '../ui/Button';
import { SelectField, TextField } from '../ui/Field';
import { searchablePlaces } from '../../data/network';
import { useAppState } from '../../state/AppState';
import { clampDeparture, toDateInput, toTimeInput } from '../../utils/datetime';

interface JourneyPlannerFormProps {
  onSubmit?: () => void;
  loading?: boolean;
}

const PAST_NOTICE = 'That time has already passed, so we moved it to the next available slot.';

export function JourneyPlannerForm({ onSubmit, loading = false }: JourneyPlannerFormProps) {
  const { plannerQuery, updatePlannerQuery } = useAppState();
  const [notice, setNotice] = useState('');
  const stepFree = plannerQuery.accessibility.includes('step-free');

  // Earliest selectable date is today; on today, the earliest time is the current minute.
  const now = new Date();
  const today = toDateInput(now);
  const minTime = plannerQuery.date === today ? toTimeInput(now) : undefined;

  const setDeparture = (date: string, time: string) => {
    const fixed = clampDeparture(date, time);
    updatePlannerQuery(fixed);
    setNotice(fixed.date !== date || fixed.time !== time ? PAST_NOTICE : '');
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // The form may have been open for a while: re-check before searching.
        const fixed = clampDeparture(plannerQuery.date, plannerQuery.time);
        if (fixed.date !== plannerQuery.date || fixed.time !== plannerQuery.time) {
          updatePlannerQuery(fixed);
          setNotice(PAST_NOTICE);
          return;
        }
        setNotice('');
        onSubmit?.();
      }}
      className="space-y-4"
      aria-label="Journey planner">

      {/* Always stacked: the planner sits in a narrow column on desktop, so side-by-side fields get cut off. */}
      <div className="space-y-3">
        <TextField
          label="From"
          value={plannerQuery.from}
          onChange={(e) => updatePlannerQuery({ from: e.target.value })}
          list="places-from"
          icon={<NavigationIcon aria-hidden className="h-4 w-4 shrink-0" />}
          placeholder="Current location" />

        <datalist id="places-from">
          {searchablePlaces.map((p) =>
          <option key={p} value={p} />
          )}
        </datalist>

        <div className="relative">
          <TextField
            label="To"
            value={plannerQuery.to}
            onChange={(e) => updatePlannerQuery({ to: e.target.value })}
            list="places-to"
            icon={<MapPinIcon aria-hidden className="h-4 w-4 shrink-0" />}
            placeholder="Destination" />

          <button
            type="button"
            onClick={() => updatePlannerQuery({ from: plannerQuery.to, to: plannerQuery.from })}
            className="absolute -top-1.5 right-0 z-10 inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted transition-colors duration-150 ease-out hover:text-cyan">
            <ArrowDownUpIcon aria-hidden className="h-3.5 w-3.5" />
            Swap
          </button>
        </div>
        <datalist id="places-to">
          {searchablePlaces.map((p) =>
          <option key={p} value={p} />
          )}
        </datalist>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Date"
          type="date"
          min={today}
          value={plannerQuery.date}
          onChange={(e) => { if (e.target.value) setDeparture(e.target.value, plannerQuery.time); }} />
        <TextField
          label="Time"
          type="time"
          min={minTime}
          value={plannerQuery.time}
          onChange={(e) => { if (e.target.value) setDeparture(plannerQuery.date, e.target.value); }} />
      </div>
      {notice && <p role="status" className="-mt-1 text-xs text-amber">{notice}</p>}

      <SelectField label="Passengers" value={String(plannerQuery.passengers)} onChange={(e) => updatePlannerQuery({ passengers: Number(e.target.value) })} icon={<UsersIcon aria-hidden className="h-4 w-4" />}>
        {[1, 2, 3, 4, 5, 6].map((n) =>
        <option key={n} value={n}>
            {n} {n === 1 ? 'passenger' : 'passengers'}
          </option>
        )}
      </SelectField>

      <label
        className={[
        'flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 text-[13px] transition-colors duration-150 ease-out',
        stepFree ? 'border-cyan-line bg-cyan-soft text-cyan' : 'border-hairline text-ink-muted hover:text-ink'].
        join(' ')}>
        <input
          type="checkbox"
          className="h-4 w-4 accent-cyan"
          checked={stepFree}
          onChange={() => updatePlannerQuery({ accessibility: stepFree ? [] : ['step-free'] })} />
        Step-free routes only
      </label>

      <Button type="submit" variant="primary" size="lg" block loading={loading} icon={<ArrowRightIcon aria-hidden className="h-4 w-4" />}>
        {loading ? 'Finding routes' : 'PLAN JOURNEY'}
      </Button>
    </form>);

}
