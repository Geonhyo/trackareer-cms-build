'use client';

import { useActionState, useState } from 'react';
import { Card, Checkbox, Field, Input, Notice, Row, Select, Stack } from '@/components/ui';
import { SubmitButton } from '@/components/ui/SubmitButton';
import type { Schemas } from '@/shared/api/types';
import { saveInstagramDmPostAction } from './actions';
import { DmContentEditor, toEditorValue } from './DmContentEditor';

type Post = Schemas['AdminInstagramDmPostDto'];
type Template = Schemas['AdminInstagramDmTemplateDto'];

export function InstagramDmForm({ post, templates }: { post?: Post; templates: Template[] }) {
  const [state, action] = useActionState(
    saveInstagramDmPostAction.bind(null, post?.id ?? null),
    null,
  );
  const [dm, setDm] = useState(() => toEditorValue(post));
  // 템플릿을 고르면 DM을 그 값으로 바꾼다 (값을 복사할 뿐, 게시물은 템플릿을 참조하지 않는다)
  const applyTemplate = (id: string) => {
    const template = templates.find((item) => String(item.id) === id);
    if (template) setDm(toEditorValue(template));
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
              팔로우를 확인하고, 팔로워에게만 아래 DM을 보내요. 팔로우하지 않았으면 팔로우를
              부탁하는 공통 DM이 가요.
            </Notice>
            {templates.length > 0 && (
              <Field
                label="템플릿 불러오기"
                hint="고르면 아래 DM을 템플릿 내용으로 바꿔요. 바꾼 뒤 고쳐도 템플릿은 그대로예요."
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
            <DmContentEditor value={dm} onChange={setDm} linkRequired />
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
