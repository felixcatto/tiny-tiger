import { filterTypes } from '../lib/utils.js';

const defaultFiltersMap = new Map();

defaultFiltersMap.set('author.name', {
  filterBy: 'author.name',
  filterType: filterTypes.search,
  filter: '',
});
defaultFiltersMap.set('text', {
  filterBy: 'text',
  filterType: filterTypes.search,
  filter: '',
});
defaultFiltersMap.set('is_completed', {
  filterBy: 'is_completed',
  filterType: filterTypes.select,
  filter: [],
});

export const defaultFilters = Object.fromEntries(defaultFiltersMap);
