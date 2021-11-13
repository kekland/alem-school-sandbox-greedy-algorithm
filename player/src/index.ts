import { getState, IState } from "./game/state"
import { IIntent } from "./intents/intent";
import { tick } from "./tick";

const stateHistory: IState[] = [];
const intentHistory: IIntent[] = [];

while (true) {
  try {
    const state = getState({ history: stateHistory });

    const intent = tick({ state, stateHistory, intentHistory });

    console.log(intent.actions[0]);
    console.error(intent.actions[0]);

    stateHistory.push(state);
    intentHistory.push(intent);
  }
  catch (e) {
    console.error(e)
  }
}
