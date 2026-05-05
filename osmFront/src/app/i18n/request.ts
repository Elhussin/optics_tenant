import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';
import { getTrenMessagesFiles } from '@/src/shared/utils/getTrenMessagesFiles';
 
export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messages = await getTrenMessagesFiles(locale);
 
  return {
    locale,
    messages,
    timeZone: process.env.NEXT_PUBLIC_TIMEZONE ?? 'UTC'
  };
});