import type { Schemas } from '@/shared/api/types';
import { formatPercent } from '@/shared/lib/format';
import { perThousand } from './insights-types';

type Focus = Schemas['AdminInstagramFocusDto'];

const times = (ratio: number | null) => `${(ratio ?? 0).toFixed(1)}배`;
const percent = (rate: number | null) => formatPercent(rate, 0);

/** 서버가 고른 '집중할 것'(kind + 값)을 문장 · 이동 경로로 */
export function focusText(focus: Focus): { title: string; detail: string; href: string | null } {
  switch (focus.kind) {
    case 'BEST_CATEGORY':
      return {
        title: `팔로우를 가장 잘 데려오는 형식: ${focus.category}`,
        detail: `도달 1,000명당 팔로우 ${perThousand(focus.rate)}명으로 ${focus.compareCategory}의 ${times(focus.ratio)}예요. 이 형식을 더 자주 올려 보세요.`,
        href: null,
      };
    case 'SAVES_WITHOUT_FOLLOWS':
      return {
        title: `저장은 많은데 팔로우로 안 이어져요: ${focus.category}`,
        detail: `저장은 전체 평소의 ${times(focus.ratio)}, 팔로우 전환은 ${times(focus.compareRatio)}예요. 마지막 장이나 캡션에 팔로우하면 얻는 것을 적어 보세요.`,
        href: null,
      };
    case 'FUNNEL_TAP_DROP':
      return {
        title: "DM을 받고도 '링크 받기'를 누르지 않는 사람이 많아요",
        detail: `첫 DM ${focus.count}명 중 ${percent(focus.rate)}만 눌렀어요. 첫 DM 문구에 무엇을 받는지 더 구체적으로 적어 보세요.`,
        href: '/instagram-dm',
      };
    case 'FUNNEL_FOLLOW_DROP':
      return {
        title: '팔로우 요청에서 많이 빠져요',
        detail: `팔로우 요청을 받은 ${focus.count}명 중 ${percent(focus.rate)}만 팔로우했어요. 팔로우하면 얻는 것을 요청 문구에 적어 보세요.`,
        href: '/instagram-dm',
      };
    case 'POSTS_WITHOUT_DM':
      return {
        title: `최근 게시물 ${focus.count}개에 자동 DM이 없어요`,
        detail:
          '댓글로 링크를 받으려는 사람을 팔로우로 이어 갈 기회를 놓치고 있어요. 인스타 DM에 등록해 보세요.',
        href: '/instagram-dm/new',
      };
  }
}
