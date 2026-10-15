'use client';

import { Button, Card, Field, Grid, Input, Notice, Row, Stack, Textarea } from '@/components/ui';
import type { Schemas } from '@/shared/api/types';

export type DmContent = Pick<
  Schemas['AdminInstagramDmTemplateDto'],
  'dmType' | 'message' | 'buttons' | 'cards'
>;
type DmLink = DmContent['buttons'][number];
type DmCard = DmContent['cards'][number];

const DM_TYPE_OPTIONS: Array<{ key: DmContent['dmType']; label: string }> = [
  { key: 'BUTTONS', label: '버튼형' },
  { key: 'CARDS', label: '카드형' },
];

// 인스타 템플릿 한도 (서버 DM_LIMITS와 같다)
const MAX_BUTTONS = 3;
const MAX_CARDS = 10;

const EMPTY_LINK: DmLink = { label: '', url: '' };
const EMPTY_CARD: DmCard = { title: '', subtitle: null, imageUrl: null, buttons: [EMPTY_LINK] };

export const EMPTY_DM_CONTENT: DmContent = {
  dmType: 'BUTTONS',
  message: '',
  buttons: [{ label: '링크 열기', url: '' }],
  cards: [EMPTY_CARD],
};

/** 저장된 DM 내용을 편집기 값으로 (비어 있는 쪽 형식도 바로 쓸 수 있게 한 칸씩 채운다) */
export function toEditorValue(content?: DmContent): DmContent {
  if (!content) return EMPTY_DM_CONTENT;
  return {
    ...content,
    buttons: content.buttons.length > 0 ? content.buttons : EMPTY_DM_CONTENT.buttons,
    cards: content.cards.length > 0 ? content.cards : EMPTY_DM_CONTENT.cards,
  };
}

/**
 * 팔로우 확인 뒤 보낼 DM 편집 (게시물 · 템플릿 공통).
 * 버튼형: 문구 말풍선 + 링크 버튼 1~3개. 카드형: 문구 메시지 뒤 카드 1~10장(카드마다 버튼 1~3개).
 * 폼에는 hidden input `dm`(JSON)으로 실린다.
 */
export function DmContentEditor({
  value,
  onChange,
  linkRequired,
}: {
  value: DmContent;
  onChange: (next: DmContent) => void;
  // 게시물은 링크 필수, 템플릿은 비워 두고 게시물마다 넣을 수 있다
  linkRequired: boolean;
}) {
  const set = (patch: Partial<DmContent>) => onChange({ ...value, ...patch });
  const setCard = (index: number, patch: Partial<DmCard>) =>
    set({ cards: value.cards.map((card, i) => (i === index ? { ...card, ...patch } : card)) });

  return (
    <Stack>
      <input type="hidden" name="dm" value={JSON.stringify(value)} />
      <Row>
        {DM_TYPE_OPTIONS.map((option) => (
          <Button
            key={option.key}
            size="sm"
            variant={value.dmType === option.key ? 'primary' : 'secondary'}
            aria-pressed={value.dmType === option.key}
            onClick={() => set({ dmType: option.key })}
          >
            {option.label}
          </Button>
        ))}
      </Row>
      <Notice>
        {value.dmType === 'BUTTONS'
          ? '문구 말풍선 하나에 링크 버튼을 1~3개 붙여 보내요.'
          : '문구 메시지를 먼저 보내고, 이어서 가로로 넘기는 카드(1~10장)를 보내요. 카드마다 링크 버튼 1~3개.'}
      </Notice>
      <Field label="문구" hint="640자까지">
        <Textarea
          rows={4}
          maxLength={640}
          required
          placeholder={'팔로우 감사합니다! 💛\n요청하신 공고 모음이에요 👇'}
          value={value.message}
          onChange={(event) => set({ message: event.target.value })}
        />
      </Field>

      {value.dmType === 'BUTTONS' ? (
        <LinksEditor
          links={value.buttons}
          onChange={(buttons) => set({ buttons })}
          linkRequired={linkRequired}
        />
      ) : (
        <Stack>
          {value.cards.map((card, index) => (
            <Card key={index} title={`카드 ${index + 1}`}>
              <Stack>
                <Grid min={240}>
                  <Field label="제목" hint="80자까지">
                    <Input
                      maxLength={80}
                      required
                      placeholder="마케팅 인턴 5곳"
                      value={card.title}
                      onChange={(event) => setCard(index, { title: event.target.value })}
                    />
                  </Field>
                  <Field label="설명" hint="80자까지, 선택">
                    <Input
                      maxLength={80}
                      placeholder="10월 3주차"
                      value={card.subtitle ?? ''}
                      onChange={(event) => setCard(index, { subtitle: event.target.value })}
                    />
                  </Field>
                </Grid>
                <Field label="이미지 주소" hint="선택. https로 시작하는 이미지 링크">
                  <Input
                    type="url"
                    placeholder="https://www.trackareer.com/..."
                    value={card.imageUrl ?? ''}
                    onChange={(event) => setCard(index, { imageUrl: event.target.value })}
                  />
                </Field>
                <LinksEditor
                  links={card.buttons}
                  onChange={(buttons) => setCard(index, { buttons })}
                  linkRequired={linkRequired}
                />
                {value.cards.length > 1 && (
                  <Row>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => set({ cards: value.cards.filter((_, i) => i !== index) })}
                    >
                      카드 빼기
                    </Button>
                  </Row>
                )}
              </Stack>
            </Card>
          ))}
          {value.cards.length < MAX_CARDS && (
            <Row>
              <Button size="sm" onClick={() => set({ cards: [...value.cards, EMPTY_CARD] })}>
                카드 추가 ({value.cards.length}/{MAX_CARDS})
              </Button>
            </Row>
          )}
        </Stack>
      )}
    </Stack>
  );
}

function LinksEditor({
  links,
  onChange,
  linkRequired,
}: {
  links: DmLink[];
  onChange: (next: DmLink[]) => void;
  linkRequired: boolean;
}) {
  const setLink = (index: number, patch: Partial<DmLink>) =>
    onChange(links.map((link, i) => (i === index ? { ...link, ...patch } : link)));
  return (
    <Stack>
      {links.map((link, index) => (
        <Row key={index}>
          <Input
            aria-label={`버튼 ${index + 1} 글자`}
            maxLength={20}
            required
            placeholder="버튼 글자 (20자)"
            value={link.label}
            onChange={(event) => setLink(index, { label: event.target.value })}
            style={{ width: 180 }}
          />
          <Input
            aria-label={`버튼 ${index + 1} 링크`}
            type="url"
            maxLength={1000}
            required={linkRequired}
            placeholder={linkRequired ? 'https://...' : 'https://... (비우면 게시물마다 넣기)'}
            value={link.url}
            onChange={(event) => setLink(index, { url: event.target.value })}
            style={{ flex: 1 }}
          />
          {links.length > 1 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onChange(links.filter((_, i) => i !== index))}
            >
              빼기
            </Button>
          )}
        </Row>
      ))}
      {links.length < MAX_BUTTONS && (
        <Row>
          <Button size="sm" onClick={() => onChange([...links, EMPTY_LINK])}>
            버튼 추가 ({links.length}/{MAX_BUTTONS})
          </Button>
        </Row>
      )}
    </Stack>
  );
}
