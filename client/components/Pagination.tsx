import cn from 'classnames';
import React from 'react';
import { makeEnum } from '../lib/utils.js';
import { Select } from './Select.js';
import s from './Pagination.module.css';

type IPaginationProps = {
  page: number;
  size: number;
  totalRows: number;
  onPageChange: (newPage: number) => void;
  onSizeChange: (newSize: number) => void;
  siblings?: number;
  slots?: number;
  className?: string;
};

const states = makeEnum('full', 'start', 'mid', 'end');

export const Pagination = (props: IPaginationProps) => {
  const { page, size, totalRows, onPageChange, onSizeChange, siblings = 2, className = '' } = props;
  const slots = props.slots || 5 + siblings * 2;
  if (page === 0) throw new Error('page must be in range 1...n');

  const totalPages = Math.ceil(totalRows / size);
  const pages = new Array(totalPages).fill(0).map((el, i) => i + 1);
  const lastPageIndex = pages.length - 1;
  const availablePages = slots - 1 - 1 - siblings;

  let state;
  if (totalPages <= slots) {
    state = states.full;
  } else if (page <= availablePages) {
    state = states.start;
  } else if (page > totalPages - availablePages) {
    state = states.end;
  } else {
    state = states.mid;
  }

  const isPrevPageAvailable = page > 1;
  const isNextPageAvailable = page < totalPages;

  const prevPage = () => {
    if (!isPrevPageAvailable) return;
    onPageChange(page - 1);
  };
  const nextPage = () => {
    if (!isNextPageAvailable) return;
    onPageChange(page + 1);
  };
  const onSelectPage = curPage => () => onPageChange(curPage);

  const renderPage = (curPage, i) => (
    <div
      key={i}
      className={cn('btn btn_light btn_textSm', { btn_lightActive: curPage === page })}
      onClick={onSelectPage(curPage)}
    >
      {curPage}
    </div>
  );

  return (
    <div className={cn('flex items-center', className)}>
      <div className="flex gap-x-2">
        <div
          className={cn('btn btn_light btn_textSm', { btn_lightDisabled: !isPrevPageAvailable })}
          onClick={prevPage}
        >
          <i className="fa fa-angle-left fa_noColor"></i>
        </div>

        {states.full === state && pages.map(renderPage)}

        {states.start === state && (
          <>
            {pages.slice(0, availablePages + siblings).map(renderPage)}
            <div className="px-1">...</div>
            {renderPage(pages.at(-1), lastPageIndex)}
          </>
        )}

        {states.mid === state && (
          <>
            {renderPage(pages.at(0), 0)}
            <div className="px-1">...</div>
            {pages.slice(page - 1 - siblings, page + siblings).map(renderPage)}
            <div className="px-1">...</div>
            {renderPage(pages.at(-1), lastPageIndex)}
          </>
        )}

        {states.end === state && (
          <>
            {renderPage(pages.at(0), 0)}
            <div className="px-1">...</div>
            {pages.slice(totalPages - availablePages - siblings).map(renderPage)}
          </>
        )}

        <div
          className={cn('btn btn_light btn_textSm', { btn_lightDisabled: !isNextPageAvailable })}
          onClick={nextPage}
        >
          <i className="fa fa-angle-right fa_noColor"></i>
        </div>
      </div>

      <div className="ml-4">
        <Select
          options={[
            { label: '3 / page', value: 3 },
            { label: '10 / page', value: 10 },
            { label: '25 / page', value: 25 },
            { label: '50 / page', value: 50 },
          ]}
          selectedOption={{ label: `${size} / page`, value: size }}
          searchable={false}
          placeholder=""
          inputClass="input-secondary input-secondary_hover text-sm w-24"
          popupClass={s.popup}
          placement="bottom-end"
          onSelect={selectedItem => onSizeChange(selectedItem.value)}
        />
      </div>
    </div>
  );
};
