import React from 'react';
import cn from 'classnames';
import s from './Checkbox.module.css';

type ICheckboxProps = {
  onChange: (e: any) => void;
  checked: boolean;
  label?: string;
  className?: string;
  disabled?: boolean;
  display?: 'inline' | 'block';
};

export const Checkbox = (props: ICheckboxProps) => {
  const {
    onChange,
    checked,
    label = '',
    className = '',
    disabled = false,
    display = 'inline',
  } = props;

  const checkboxClass = cn(s.checkbox, className, {
    [s.checkbox_block]: display === 'block',
  });
  const visualBoxClass = cn(s.visualBox, {
    [s.visualBox_disabled]: disabled,
    [s.visualBox_active]: checked,
  });
  const checkMarkClass = cn('fa fa-check', s.checkMark, {
    [s.checkMark_active]: checked,
  });
  const labelClass = cn(s.label, {
    [s.label_disabled]: disabled,
  });

  return (
    <label className={checkboxClass}>
      <input
        type="checkbox"
        className={s.input}
        disabled={disabled}
        onChange={onChange}
        checked={checked}
      />
      <div className={visualBoxClass}>
        <i className={checkMarkClass}></i>
      </div>
      {label && <div className={labelClass}>{label}</div>}
    </label>
  );
};
