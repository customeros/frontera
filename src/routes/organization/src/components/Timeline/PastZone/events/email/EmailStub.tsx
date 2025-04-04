import { FC, useMemo } from 'react';

import { convert } from 'html-to-text';

import { cn } from '@ui/utils/cn';
import { EmailParticipant } from '@graphql/types';
import { Card, CardFooter, CardContent } from '@ui/presentation/Card/Card';
import { getEmailParticipantsByType } from '@organization/components/Timeline/PastZone/events/email/utils';
import {
  getEmailParticipantsName,
  getEmailParticipantsNameAndEmail,
} from '@utils/getParticipantsName';
import { useTimelineEventPreviewMethodsContext } from '@organization/components/Timeline/shared/TimelineEventPreview/context/TimelineEventPreviewContext';

import { InteractionEventWithDate } from '../../../types';

import postStamp from '/backgrounds/organization/post-stamp.webp';

export const EmailStub: FC<{ email: InteractionEventWithDate }> = ({
  email,
}) => {
  const { openModal } = useTimelineEventPreviewMethodsContext();
  const text = convert(email?.content || '', {
    preserveNewlines: true,
    selectors: [
      {
        selector: 'a',
        options: { hideLinkHrefIfSameAsText: true, ignoreHref: true },
      },
      {
        selector: 'img',
        format: 'skip',
      },
    ],
  });

  const { to, cc, bcc } = useMemo(
    () => getEmailParticipantsByType(email?.sentTo || []),
    [email?.sentTo],
  );

  const cleanTo = useMemo(
    () =>
      getEmailParticipantsNameAndEmail(to || [])
        .map((e) => e.label || e.email)
        .filter((data) => Boolean(data)),
    [cc],
  );

  const cleanCC = useMemo(
    () =>
      getEmailParticipantsNameAndEmail(cc || [])
        .map((e) => e.label || e.email)
        .filter((data) => Boolean(data)),
    [cc],
  );
  const cleanBCC = useMemo(
    () =>
      getEmailParticipantsNameAndEmail(bcc || [])
        .map((e) => e.label || e.email)
        .filter((data) => Boolean(data)),
    [bcc],
  );
  const isSendByTenant = (email?.sentBy?.[0] as EmailParticipant)
    ?.emailParticipant?.users?.length;

  return (
    <>
      <Card
        onClick={() => openModal(email.id)}
        className={cn(
          isSendByTenant ? 'ml-6' : 'ml-0',
          'shadow-none cursor-pointer text-sm border border-grayModern-200 bg-white flex max-w-[549px]',
          'rounded-lg hover:shadow-sm transition-all duration-200 ease-out',
        )}
      >
        <CardContent className='px-3 py-2 pr-0 overflow-hidden flex flex-row flex-1 '>
          <div className='flex flex-col items-start gap-0'>
            <p className='line-clamp-1 leading-[21px]'>
              <span className='font-medium leading-[21px]'>
                {getEmailParticipantsName(
                  email?.sentBy?.[0]
                    ? [email.sentBy[0] as EmailParticipant]
                    : [],
                )}
              </span>{' '}
              <span className='text-[#6C757D]'>emailed</span>{' '}
              <span className='font-medium mr-2'>{cleanTo?.join(', ')}</span>{' '}
              {!!cleanBCC.length && (
                <>
                  <span className='text-[#6C757D]'>BCC:</span>{' '}
                  <span>{cleanBCC.join(', ')}</span>
                </>
              )}
              {!!cleanCC.length && (
                <>
                  <span className='text-[#6C757D]'>CC:</span>{' '}
                  <span>{cleanCC.join(', ')}</span>
                </>
              )}
            </p>

            <p className='font-semibold line-clamp-1 leading-[21px]'>
              {email.interactionSession?.name}
            </p>

            <p className='line-clamp-2 break-words'>{text}</p>
          </div>
        </CardContent>
        <CardFooter className='py-2 px-3 ml-1'>
          <img width={48} alt='Email' height={70} src={postStamp} />
        </CardFooter>
      </Card>
    </>
  );
};
