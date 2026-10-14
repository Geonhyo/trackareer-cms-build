'use client';

import { Card, Checkbox, Field, Grid, Input, Notice, Stack, Textarea } from '@/components/ui';
import type { Schemas } from '@/shared/api/types';
import { formatDateTime, toKstInputValue } from '@/shared/lib/format';
import {
  saveAppUpdateAction,
  saveMaintenanceAction,
  saveStoreUrlsAction,
  saveTermsVersionAction,
} from './actions';
import { SettingsForm } from './SettingsForm';

type Settings = Schemas['AdminAppSettingsDto'];

const saved = (value: string | null | undefined) =>
  value ? `마지막 저장 ${formatDateTime(value)}` : '기본값 (저장한 적 없음)';

function PlatformFields({
  name,
  label,
  value,
}: {
  name: 'ios' | 'android';
  label: string;
  value: Settings['appUpdate']['ios'];
}) {
  return (
    <Grid min={160}>
      <Field label={`${label} 강제 기준 빌드`} hint="이 빌드 미만은 앱을 못 써요 (0 = 끔)">
        <Input
          name={`${name}.minimumBuild`}
          type="number"
          min={0}
          defaultValue={value.minimumBuild}
        />
      </Field>
      <Field label={`${label} 최신 빌드`} hint="이 빌드 미만은 권장 업데이트 (0 = 끔)">
        <Input
          name={`${name}.latestBuild`}
          type="number"
          min={0}
          defaultValue={value.latestBuild}
        />
      </Field>
      <Field label={`${label} 최신 버전`} hint="예: 2.0.1">
        <Input name={`${name}.latestVersion`} maxLength={20} defaultValue={value.latestVersion} />
      </Field>
    </Grid>
  );
}

export function AppSettingsForms({
  settings,
  readOnly,
}: {
  settings: Settings;
  readOnly: boolean;
}) {
  const { appUpdate, maintenance, storeUrls } = settings;
  return (
    <Stack>
      <Card title="업데이트" description={saved(settings.updatedAt.appUpdate)}>
        <SettingsForm
          action={saveAppUpdateAction}
          readOnly={readOnly}
          confirm="강제 기준을 올리면 그보다 낮은 빌드는 바로 앱을 쓸 수 없어요. 저장할까요?"
        >
          <PlatformFields name="ios" label="iOS" value={appUpdate.ios} />
          <PlatformFields name="android" label="Android" value={appUpdate.android} />
          <Grid min={280}>
            <Stack>
              <Field label="강제 업데이트 제목">
                <Input name="force.title" maxLength={50} defaultValue={appUpdate.force.title} />
              </Field>
              <Field label="강제 업데이트 본문">
                <Textarea
                  name="force.body"
                  maxLength={300}
                  rows={3}
                  defaultValue={appUpdate.force.body}
                />
              </Field>
            </Stack>
            <Stack>
              <Field label="권장 업데이트 제목">
                <Input
                  name="optional.title"
                  maxLength={50}
                  defaultValue={appUpdate.optional.title}
                />
              </Field>
              <Field label="권장 업데이트 본문">
                <Textarea
                  name="optional.body"
                  maxLength={300}
                  rows={3}
                  defaultValue={appUpdate.optional.body}
                />
              </Field>
            </Stack>
          </Grid>
        </SettingsForm>
      </Card>

      <Card title="점검" description={saved(settings.updatedAt.maintenance)}>
        {maintenance.enabled && (
          <div style={{ marginBottom: 16 }}>
            <Notice tone="critical">지금 점검 중이에요. 모든 앱이 점검 화면을 보고 있어요.</Notice>
          </div>
        )}
        <SettingsForm
          action={saveMaintenanceAction}
          readOnly={readOnly}
          confirm="점검을 켜면 모든 사용자가 앱을 쓸 수 없어요. 저장할까요?"
        >
          <Checkbox name="enabled" label="점검 켜기" defaultChecked={maintenance.enabled} />
          <Field label="제목">
            <Input name="title" maxLength={50} required defaultValue={maintenance.title} />
          </Field>
          <Field label="본문">
            <Textarea name="body" maxLength={500} rows={3} defaultValue={maintenance.body} />
          </Field>
          <Field label="끝나는 시각 (KST)" hint="비우면 긴급 점검 (끝나는 시각 없이 안내)">
            <Input
              name="endsAt"
              type="datetime-local"
              defaultValue={toKstInputValue(maintenance.endsAt)}
            />
          </Field>
        </SettingsForm>
      </Card>

      <Grid min={360}>
        <Card title="스토어 주소" description={saved(settings.updatedAt.storeUrls)}>
          <SettingsForm action={saveStoreUrlsAction} readOnly={readOnly}>
            <Field label="App Store">
              <Input name="ios" type="url" required defaultValue={storeUrls.ios} />
            </Field>
            <Field label="Google Play">
              <Input name="android" type="url" required defaultValue={storeUrls.android} />
            </Field>
          </SettingsForm>
        </Card>
        <Card title="약관 버전" description={saved(settings.updatedAt.termsVersion)}>
          <SettingsForm action={saveTermsVersionAction} readOnly={readOnly}>
            <Field label="버전" hint="가입 동의 기록에 찍혀요. 예: 2.0">
              <Input
                name="termsVersion"
                required
                pattern="\d+\.\d+"
                defaultValue={settings.termsVersion}
              />
            </Field>
          </SettingsForm>
        </Card>
      </Grid>
    </Stack>
  );
}
