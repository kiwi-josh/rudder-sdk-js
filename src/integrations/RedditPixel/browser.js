/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import logger from '../../utils/logUtil';
import { NAME } from './constants';
import { getHashFromArrayWithDuplicate, getEventMappingFromConfig } from '../../utils/commonUtils';
import { loadNativeSdk } from './nativeSdkLoader';

class RedditPixel {
  constructor(config, analytics, destinationInfo) {
    if (analytics.logLevel) {
      logger.setLogLevel(analytics.logLevel);
    }
    this.analytics = analytics;
    this.advertiserId = config.advertiserId;
    this.name = NAME;
    this.eventMappingFromConfig = config.eventMappingFromConfig;
    ({
      shouldApplyDeviceModeTransformation: this.shouldApplyDeviceModeTransformation,
      propagateEventsUntransformedOnError: this.propagateEventsUntransformedOnError,
      destinationId: this.destinationId,
    } = destinationInfo ?? {});
  }

  init() {
    logger.debug('===In init RedditPixel===');

    loadNativeSdk(this.advertiserId);
  }

  isLoaded() {
    logger.debug('===In isLoaded RedditPixel===');
    return !!(window.rdt && window.rdt.advertiserId === this.advertiserId);
  }

  isReady() {
    logger.debug('===In isReady RedditPixel===');
    return !!(window.rdt && window.rdt.advertiserId === this.advertiserId);
  }

  identify(rudderElement) {
    logger.debug('===In RedditPixel identify===');
    window.rdt('track', 'SignUp');
  }

  track(rudderElement) {
    logger.debug('===In RedditPixel track===');

    const { event } = rudderElement.message;
    if (!event) {
      logger.error('Event name is not present');
      return;
    }
    const eventMappingFromConfigMap = getHashFromArrayWithDuplicate(
      this.eventMappingFromConfig,
      'from',
      'to',
      false,
    );
    if (eventMappingFromConfigMap[event]) {
      // mapping event from UI
      const events = getEventMappingFromConfig(event, eventMappingFromConfigMap);
      events.forEach((ev) => {
        window.rdt('track', ev);
      });
    } else {
      switch (event.toLowerCase()) {
        case 'product added':
          window.rdt('track', 'AddToCart');
          break;
        case 'product added to wishlist':
          window.rdt('track', 'AddToWishlist');
          break;
        case 'order completed':
          window.rdt('track', 'Purchase');
          break;
        case 'lead':
          window.rdt('track', 'Lead');
          break;
        case 'view content':
          window.rdt('track', 'ViewContent');
          break;
        case 'search':
          window.rdt('track', 'Search');
          break;
        default:
          logger.error(`Invalid event ${event}. Track call not supported`);
          break;
      }
    }
  }

  page(rudderElement) {
    logger.debug('===In RedditPixel page===');
    window.rdt('track', 'PageVisit');
  }
}

export default RedditPixel;
