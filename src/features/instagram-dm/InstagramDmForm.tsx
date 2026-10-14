'use client';

import { useActionState, useState } from 'react';
import {
  Card,
  Checkbox,
  Field,
  Grid,
  Input,
  Notice,
  Row,
  Select,
  Stack,
  Textarea,
} from '@/components/ui';
import { SubmitButton } from '@/components/ui/SubmitButton';
import type { Schemas } from '@/shared/api/types';
import { saveInstagramDmPostAction } from './actions';

type Post = Schemas['AdminInstagramDmPostDto'];
type Template = Schemas['AdminInstagramDmTemplateDto'];
type DmFields = { message: string; linkUrl: string; buttonLabel: string };

export function InstagramDmForm({ post, templates }: { post?: Post; templates: Template[] }) {
  const [state, action] = useActionState(
    saveInstagramDmPostAction.bind(null, post?.id ?? null),
    null,
  );
  // 템플릿을 고르면 DM 칸을 그 값으로 다시 그린다 (값을 복사할 뿐, 게시물은 템플릿을 참조하지 않는다)
  const [dm, setDm] = useState<DmFields & { version: number }>({
    message: post?.message ?? '',
    linkUrl: post?.linkUrl ?? '',
    buttonLabel: post?.buttonLabel ?? '',
    version: 0,
  });
  const applyTemplate = (id: string) => {
    const template = templates.find((item) => String(item.id) === id);
    if (!template) return;
    setDm((prev) => ({
      message: template.message,
      // 템플릿에 링크가 없으면 지금 칸을 그대로 둔다
      linkUrl: template.linkUrl ?? prev.linkUrl,
      buttonLabel: template.buttonLabel ?? '',
      version: prev.version + 1,
    }));
  };
  return (
    <form action={action}>
      <Stack>
        <Card title="게시물">
          <Stack>
            <Field label="이름" hint="cms에서 알아보기 위한 이름이에요. DM에는 나가지 않아요.">
              <Input
                name="title"
                maxLength={100}
                required
                placeholder="10월 3주차 인턴 공고 모음"
                defaultValue={post?.title}
              />
            </Field>
            <Field
              label="게시물 주소"
              hint="인스타 앱에서 게시물 → 공유 → 링크 복사한 값을 그대로 붙여 넣으세요."
            >
              <Input
                name="postUrl"
                type="url"
                maxLength={500}
                required
                placeholder="https://www.instagram.com/p/..."
                defaultValue={post?.postUrl}
              />
            </Field>
            <Field
              label="댓글 키워드"
              hint="이 단어가 들어간 댓글에만 DM을 보내요. 비우면 모든 댓글에 보내요."
            >
              <Input
                name="keyword"
                maxLength={50}
                placeholder="트래커리어"
                defaultValue={post?.keyword ?? ''}
              />
            </Field>
          </Stack>
        </Card>

        <Card title="팔로우 확인 뒤 보낼 DM">
          <Stack>
            <Notice>
              댓글을 단 사람에게는 먼저 공통 DM(&quot;링크 받기&quot; 버튼)이 가요. 버튼을 누르면
              팔로우를 확인하고, 팔로워에게만 아래 문구와 링크 버튼을 보내요. 팔로우하지 않았으면
              팔로우를 부탁하는 공통 DM이 가요.
            </Notice>
            {templates.length > 0 && (
              <Field
                label="템플릿 불러오기"
                hint="고르면 아래 문구 · 링크 · 버튼 글자를 채워요. 채운 뒤 고쳐도 템플릿은 그대로예요."
              >
                <Select defaultValue="" onChange={(event) => applyTemplate(event.target.value)}>
                  <option value="" disabled>
                    템플릿 고르기
                  </option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
            <Field key={`message-${dm.version}`} label="문구" hint="640자까지">
              <Textarea
                name="message"
                rows={5}
                maxLength={640}
                required
                placeholder={'팔로우 감사합니다! 💛\n요청하신 공고 모음이에요 👇'}
                defaultValue={dm.message}
              />
            </Field>
            <Grid key={`link-${dm.version}`} min={240}>
              <Field label="링크">
                <Input
                  name="linkUrl"
                  type="url"
                  maxLength={1000}
                  required
                  placeholder="https://www.trackareer.com/c/..."
                  defaultValue={dm.linkUrl}
                />
              </Field>
              <Field label="버튼 글자" hint="20자까지. 비우면 '링크 열기'">
                <Input
                  name="buttonLabel"
                  maxLength={20}
                  placeholder="링크 열기"
                  defaultValue={dm.buttonLabel}
                />
              </Field>
            </Grid>
            <Checkbox
              name="isActive"
              label="DM 보내기 켜기"
              defaultChecked={post?.isActive ?? true}
            />
            {state && !state.ok && <Notice tone="critical">{state.error}</Notice>}
            {state?.ok && state.message && <Notice tone="positive">{state.message}</Notice>}
            <Row>
              <SubmitButton pendingText="저장 중…">{post ? '저장' : '등록'}</SubmitButton>
            </Row>
          </Stack>
        </Card>
      </Stack>
    </form>
  );
}
