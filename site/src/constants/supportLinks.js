/** Shared support & repo URLs (vitrine + Help dock). */

export const GITLAB_REPO = "https://gitlab.com/zzcyph1/home-assistant/hub-energie";
export const GITLAB_WORK_ITEMS = `${GITLAB_REPO}/-/work_items`;
export const FACEBOOK_GROUP = "https://www.facebook.com/groups/hubenergie";

export function serviceDeskMailto() {
  return (
    "mailto:feedback@hub-energie.ts-devops.com?subject=" + encodeURIComponent("Hub Énergie — support")
  );
}

export function feedbackMailto() {
  return (
    "mailto:feedback@hub-energie.ts-devops.com?subject=" + encodeURIComponent("Hub Énergie — feedback")
  );
}
