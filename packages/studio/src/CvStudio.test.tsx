import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { defaultTheme, sampleCv } from '@scorrrpy/cv-engine';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CvStudio } from './CvStudio';
import { emptyCv } from './state/studioReducer';
import { memoryStorage } from './storage';

afterEach(cleanup);

describe('CvStudio', () => {
  it('shows the sample CV in the chosen UI language', () => {
    render(<CvStudio uiLocale="de" />);
    expect(screen.getByRole('button', { name: 'PDF herunterladen' })).toBeDefined();
    expect(screen.getByDisplayValue('Max Mustermann')).toBeDefined();
    expect(screen.getAllByDisplayValue('Softwareentwickler')).toHaveLength(2);
  });

  it('switches the language of the edited texts', () => {
    render(<CvStudio uiLocale="de" />);
    fireEvent.click(screen.getByRole('button', { name: 'EN' }));
    expect(screen.getAllByDisplayValue('Software Developer')).toHaveLength(2);
  });

  it('adds list entries', () => {
    render(<CvStudio uiLocale="en" initialData={emptyCv()} />);
    expect(screen.getAllByText('No entries yet.')).toHaveLength(6);
    fireEvent.click(screen.getAllByRole('button', { name: '+ Add' })[0]!);
    expect(screen.getAllByText('No entries yet.')).toHaveLength(5);
    expect(screen.getByText('New entry')).toBeDefined();
  });

  it('shows the design tab with a contrast warning for unreadable colours', () => {
    render(<CvStudio uiLocale="en" />);
    fireEvent.click(screen.getByRole('tab', { name: 'Design' }));
    fireEvent.change(screen.getByLabelText('Text'), { target: { value: '#ffffff' } });
    expect(screen.getByRole('status').textContent).toContain('“Text” is hard to read');
  });

  it('restores the stored state instead of the initial data', async () => {
    const storage = memoryStorage();
    await storage.save({ data: { ...sampleCv, person: { ...sampleCv.person, name: 'Erika' } }, theme: defaultTheme });
    render(<CvStudio uiLocale="en" storage={storage} />);
    await waitFor(() => expect(screen.getByDisplayValue('Erika')).toBeDefined());
  });

  it('saves changes to the storage', async () => {
    const storage = memoryStorage();
    const save = vi.spyOn(storage, 'save');
    render(<CvStudio uiLocale="en" storage={storage} />);
    await waitFor(() => expect(screen.getByDisplayValue('Max Mustermann')).toBeDefined());
    await new Promise((resolve) => setTimeout(resolve, 0));
    fireEvent.change(screen.getByDisplayValue('Max Mustermann'), { target: { value: 'Max M.' } });
    await waitFor(() => expect(save).toHaveBeenCalled());
    expect(save.mock.lastCall![0].data.person.name).toBe('Max M.');
  });
});
