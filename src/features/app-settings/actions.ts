'use server';

import { revalidatePath } from 'next/cache';
import { adminApi } from '@/shared/api/admin-api';
import { toActionError, type ActionResult } from '@/shared/api/errors';
import { fromKstInputValue } from '@/shared/lib/format';

const text = (formData: FormData, key: string) => String(formData.get(key) ?? '').trim();
const int = (formData: FormData, key: string) => Number.parseInt(text(formData, key) || '0', 10);

async function save(path: string, body: unknown, message: string): Promise<ActionResult> {
  try {
    await adminApi(`/admin/app-settings/${path}`, { method: 'PUT', body });
  } catch (error) {
    return toActionError(error);
  }
  revalidatePath('/app-settings');
  return { ok: true, data: undefined, message };
}

export async function saveAppUpdateAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const platform = (key: 'ios' | 'android') => ({
    minimumBuild: int(formData, `${key}.minimumBuild`),
    latestBuild: int(formData, `${key}.latestBuild`),
    latestVersion: text(formData, `${key}.latestVersion`),
  });
  return save(
    'app-update',
    {
      ios: platform('ios'),
      android: platform('android'),
      force: {
        title: text(formData, 'force.title'),
        body: String(formData.get('force.body') ?? ''),
      },
      optional: {
        title: text(formData, 'optional.title'),
        body: String(formData.get('optional.body') ?? ''),
      },
    },
    '저장했어요. 앱을 새로 열 때부터 적용돼요.',
  );
}

export async function saveMaintenanceAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return save(
    'maintenance',
    {
      enabled: formData.get('enabled') === 'on',
      title: text(formData, 'title'),
      body: String(formData.get('body') ?? ''),
      endsAt: fromKstInputValue(formData.get('endsAt')),
    },
    '저장했어요.',
  );
}

export async function saveStoreUrlsAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return save(
    'store-urls',
    { ios: text(formData, 'ios'), android: text(formData, 'android') },
    '저장했어요.',
  );
}

export async function saveTermsVersionAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return save(
    'terms-version',
    { termsVersion: text(formData, 'termsVersion') },
    '저장했어요. 이제부터 가입하는 회원의 동의 기록에 이 버전이 찍혀요.',
  );
}
