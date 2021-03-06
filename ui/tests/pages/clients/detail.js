import {
  attribute,
  create,
  collection,
  clickable,
  hasClass,
  text,
  isPresent,
  visitable,
} from 'ember-cli-page-object';

export default create({
  visit: visitable('/clients/:id'),

  breadcrumbs: collection('[data-test-breadcrumb]', {
    id: attribute('data-test-breadcrumb'),
    text: text(),
    visit: clickable(),
  }),

  breadcrumbFor(id) {
    return this.breadcrumbs.toArray().find(crumb => crumb.id === id);
  },

  title: text('[data-test-title]'),

  statusLight: collection('[data-test-node-status]', {
    id: attribute('data-test-node-status'),
    text: text(),
  }),

  statusDefinition: text('[data-test-status-definition]'),
  statusDecorationClass: attribute('class', '[data-test-status-definition] .status-text'),
  addressDefinition: text('[data-test-address-definition]'),
  drainingDefinition: text('[data-test-draining]'),
  eligibilityDefinition: text('[data-test-eligibility]'),
  datacenterDefinition: text('[data-test-datacenter-definition]'),

  allocations: collection('[data-test-allocation]', {
    id: text('[data-test-short-id]'),
    modifyTime: text('[data-test-modify-time]'),
    name: text('[data-test-name]'),
    status: text('[data-test-client-status]'),
    job: text('[data-test-job]'),
    taskGroup: text('[data-test-task-group]'),
    jobVersion: text('[data-test-job-version]'),
    cpu: text('[data-test-cpu]'),
    cpuTooltip: attribute('aria-label', '[data-test-cpu] .tooltip'),
    mem: text('[data-test-mem]'),
    memTooltip: attribute('aria-label', '[data-test-mem] .tooltip'),

    visit: clickable('[data-test-short-id] a'),
    visitJob: clickable('[data-test-job]'),
  }),

  attributesTable: isPresent('[data-test-attributes]'),
  metaTable: isPresent('[data-test-meta]'),
  emptyMetaMessage: isPresent('[data-test-empty-meta-message]'),

  metaAttributes: collection('[data-test-meta] [data-test-attributes-section]', {
    key: text('[data-test-key]'),
    value: text('[data-test-value]'),
  }),

  error: {
    isShown: isPresent('[data-test-error]'),
    title: text('[data-test-error-title]'),
    message: text('[data-test-error-message]'),
    seekHelp: clickable('[data-test-error-message] a'),
  },

  hasEvents: isPresent('[data-test-client-events]'),
  events: collection('[data-test-client-event]', {
    time: text('[data-test-client-event-time]'),
    subsystem: text('[data-test-client-event-subsystem]'),
    message: text('[data-test-client-event-message]'),
  }),

  driverHeads: collection('[data-test-driver-status] [data-test-accordion-head]', {
    name: text('[data-test-name]'),
    detected: text('[data-test-detected]'),
    lastUpdated: text('[data-test-last-updated]'),
    healthIsShown: isPresent('[data-test-health]'),
    health: text('[data-test-health]'),
    healthClass: attribute('class', '[data-test-health] .color-swatch'),

    toggle: clickable('[data-test-accordion-toggle]'),
  }),

  driverBodies: collection('[data-test-driver-status] [data-test-accordion-body]', {
    description: text('[data-test-health-description]'),
    descriptionIsShown: isPresent('[data-test-health-description]'),
    attributesAreShown: isPresent('[data-test-driver-attributes]'),
  }),

  drain: {
    deadline: text('[data-test-drain-deadline]'),
    forcedDeadline: text('[data-test-drain-forced-deadline]'),
    hasForcedDeadline: isPresent('[data-test-drain-forced-deadline]'),
    ignoreSystemJobs: text('[data-test-drain-ignore-system-jobs]'),
    badgeIsDangerous: hasClass('is-danger', '[data-test-drain-deadline] .badge'),
    badgeLabel: text('[data-test-drain-deadline] .badge'),
  },
});
