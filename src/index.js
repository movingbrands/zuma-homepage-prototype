import { isReady, setClass } from './js/utils';
import { MediaController } from './js/media'
import { StateController } from './js/state'

// Set of "states" for each panel depending on the index (0, 1, 2...)
// If there is a id for a video element, this video will be played
const panelStates = [
    {
        video: '#video-0',
        next: 'Explore Zuma'
    },
    {
        video: '#video-1',
        next: 'Look inside'
    },
    {
        video: '#video-2',
        next: 'Next'
    },
    {
        video: '#video-3',
        next: 'Explore'
    },
    {
        next: 'Done'
    }
]

// Initiate when the DOM is ready
isReady(async () => {
    try {
        // Store all the relevant DOM elements
        const container = document.getElementById('showcase')
        const dom = {
            container,
            panels: container.querySelectorAll('article'),
            progress: document.getElementById('progress-bar'),
            next: document.getElementById('next'),
            back: document.getElementById('back')
        }
        const count = dom.panels.length

        // Preload all the video (by id) into a controller to manage them and
        // ensure that they have loaded fully 
        const media = await MediaController(
            panelStates.filter(p => !!p.video).map(p => p.video)
        )

        // When the media is preloaded, make the container visible
        setClass(dom.container, 'active')

        // UI updates to make before the transition is complete
        const updateBeforeTransition = (index) => {

            // Add transition class to container while the video is playing
            setClass(dom.container, 'transition', true)

            // Update the progress indicator on right hand side
            dom.progress.style.transform = `scale(1.0, ${1 / count}) translateY(${index * 100}%)`

            // Iterate through the panels and set active class if panel is visible
            for (let i = 0; i < count; i++) {
                setClass(dom.panels[i], 'active', index === i)
            }
        }

        // UI updates to make after the transition is complete
        const updateAfterTransition = (index, { canNavigateForward, canNavigateBack }, panelState) => {

            // Update the next button text
            if (panelState.next) dom.next.innerText = panelState.next

            // Toggle button visibility depending on where the user is in the sequence
            setClass(dom.next, 'active', canNavigateForward)
            setClass(dom.back, 'active', canNavigateBack)

            // Iterate through the panels and toggle visibility depending on which panel is active
            for (let i = 0; i < count; i++) {
                dom.panels[i].style.opacity = i <= index ? 1.0 : 0.0
            }

            // Remove transition class from container
            setClass(dom.container, 'transition', false)
        }

        const listeners = {}

        // Simple state manager which manages a state object with
        // three values:
        // @param {number} index - Where the user is in the sequence 
        // @param {boolean} canNavigateForward - Is there a 'next' panel 
        // @param {boolean} canNavigateBack - Is there a 'previous' panel 
        StateController({
            // Number of panels to manage
            count,
            // Starting position (default: 0)
            initialIndex: 0,
            // onCreated is fired once after the state has been set up
            onCreated: ({
                state: {
                    index,
                    canNavigateForward,
                    canNavigateBack
                },
                next,
                previous
            }) => {
                // setup event listeners for the UI
                listeners.next = dom.next.addEventListener('click', next)
                listeners.back = dom.back.addEventListener('click', previous)

                // Apply pre- and post-transition styles at once the first time
                // the component is started
                updateBeforeTransition(index)
                updateAfterTransition(index, {
                    canNavigateForward,
                    canNavigateBack,
                }, panelStates[index])
            },
            // onChange is fired every time there's a change (i.e. when
            // the next/back buttons are clicked)
            onChange: async ({
                state: {
                    index,
                    canNavigateForward,
                    canNavigateBack
                },
                prevIndex,
                delta
            }) => {

                // Before we play video or change index, apply
                // transition classes and styles
                updateBeforeTransition(index)

                // Check if the user is going back or forward
                if (delta === -1) {

                    // If the user is going back to a previous panel, reset
                    // all the videos to their start
                    await media.resetAll()
                } else {

                    // If the user is going forward to the next panel, play the
                    // video, await is delayed by the video's duration
                    await media.play(panelStates[prevIndex].video)
                }

                // Apply final UI updates after the video has played out
                updateAfterTransition(index, { canNavigateForward, canNavigateBack }, panelStates[index])
            }
        })
    } catch (e) {
        console.log(e)
    }

    // If we're disposing of this component we could
    // also remove the event listeners
    // dom.next.removeEventListener('click', listeners.next)
    // dom.back.addEventListener('click', listeners.back)
});
