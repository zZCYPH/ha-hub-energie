import { inject, nextTick } from "vue";

/** Provided by DocView for configure-section “jump to simulator” buttons. */
export const DOC_FLOWSIM_JUMPS_KEY = Symbol("hubEnergieDocFlowsimJumps");

export function createDocFlowsimJumpHandlers(router) {
  return {
    jumpToSetupFlowsim(stepId) {
      if (!stepId) return Promise.resolve();
      return router
        .push({ name: "doc", hash: "#configure-flow-simulator" })
        .then(() =>
          nextTick(() => {
            window.dispatchEvent(new CustomEvent("hub-energie-flowsim-jump", { detail: { stepId } }));
          }),
        );
    },
    jumpToOptionsFlowsim(stepId) {
      if (!stepId) return Promise.resolve();
      return router
        .push({ name: "doc", hash: "#configure-advanced" })
        .then(() =>
          nextTick(() => {
            window.dispatchEvent(
              new CustomEvent("hub-energie-options-flowsim-jump", { detail: { stepId } }),
            );
          }),
        );
    },
  };
}

const noopJumps = {
  jumpToSetupFlowsim: () => Promise.resolve(),
  jumpToOptionsFlowsim: () => Promise.resolve(),
};

export function useDocFlowsimJumps() {
  return inject(DOC_FLOWSIM_JUMPS_KEY, noopJumps);
}
