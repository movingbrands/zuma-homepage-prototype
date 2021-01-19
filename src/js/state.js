import { constrain } from './utils'

export const StateController = ({ initialIndex = 0, count, onCreated, onChange }) => {

    // boolean values to update whether the ui next/back buttons should be shown
    const state = {
        index: initialIndex,
        canNavigateForward: false,
        canNavigateBack: false
    }

    const updateControls = () => {
        state.canNavigateForward = state.index < count - 1
        state.canNavigateBack = state.index > 0
    }

    const update = (newIndex) => {
        // store previous index and the delta of state change (-1 or 1)
        const prevIndex = state.index
        const delta = Math.sign(newIndex - state.index)

        // constrain the new state between 0 and the total number of stages
        state.index = constrain(newIndex, 0, count)

        updateControls()

        // when the state changes, emit an event with data
        onChange({
            state,
            prevIndex,
            delta
        })
    }

    updateControls()

    onCreated({
        state,
        next: () => update(state.index + 1),
        previous: () => update(state.index - 1)
    })
}
