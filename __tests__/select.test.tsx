/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { popoverRootId } from '../client/lib/utils.jsx';
import { Select } from '../client/ui/Select.jsx';
import { ISelectedOption } from '../server/lib/types.js';

describe('Select', () => {
  const options = [
    { label: '', value: '' },
    { label: 'Banana', value: 'Banana' },
    { label: 'Ananas', value: 'Ananas' },
    { label: 'Grains', value: 'Grains' },
    { label: 'Butter', value: 'Butter' },
  ];

  const renderSelect = (onSelect, selectedOption: ISelectedOption = null) => (
    <div>
      <Select options={options} selectedOption={selectedOption} onSelect={onSelect} />
      <div id={popoverRootId}></div>
    </div>
  );

  it('should work', async () => {
    const onSelect = jest.fn();
    let popupEl, optionEl;
    const user = userEvent.setup();
    const { rerender } = render(renderSelect(onSelect));

    const inputEl = screen.getByTestId('input');
    popupEl = screen.queryByTestId('popup');
    expect(inputEl).toHaveValue('');
    expect(popupEl).not.toBeInTheDocument();

    await user.click(inputEl);
    popupEl = screen.queryByTestId('popup');
    expect(popupEl).toBeInTheDocument();
    expect(screen.queryAllByTestId('option')).toHaveLength(5);

    await user.type(inputEl, 'an');
    expect(screen.queryAllByTestId('option')).toHaveLength(2);

    await user.type(inputEl, 'not exists');
    expect(screen.queryAllByTestId('option')).toHaveLength(0);
    expect(screen.getByTestId('not-found')).toBeInTheDocument();

    const newSelectedOption = options[3];
    await user.clear(inputEl);
    optionEl = await screen.findByText(newSelectedOption.label);
    await user.click(optionEl);
    rerender(renderSelect(onSelect, newSelectedOption));
    const calledArg = onSelect.mock.calls[0][0];
    popupEl = screen.queryByTestId('popup');
    expect(calledArg).toEqual(newSelectedOption);
    expect(inputEl).toHaveValue(newSelectedOption.label);
    expect(popupEl).not.toBeInTheDocument();

    await user.click(inputEl);
    optionEl = screen.getByText(newSelectedOption.label);
    expect(screen.queryAllByTestId('option')).toHaveLength(5);
    expect(optionEl).toHaveClass('option_selected', 'option_keyboardChoosen');
  });

  it('should work with keyboard buttons', async () => {
    const onSelect = jest.fn();
    let popupEl;
    const user = userEvent.setup();
    render(renderSelect(onSelect));

    const inputEl = screen.getByTestId('input');
    await user.click(inputEl);
    await user.keyboard('[Escape]');
    popupEl = screen.queryByTestId('popup');
    expect(popupEl).not.toBeInTheDocument();

    await user.click(inputEl);
    await user.keyboard('[ArrowDown][ArrowDown]');
    const optionEl = screen.queryAllByTestId('option')[1];
    expect(optionEl).toHaveClass('option_keyboardChoosen');

    await user.keyboard('[Enter]');
    popupEl = screen.queryByTestId('popup');
    const calledArg = onSelect.mock.calls[0][0];
    expect(popupEl).not.toBeInTheDocument();
    expect(calledArg).toEqual(options[1]);
  });
});
