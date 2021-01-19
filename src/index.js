import { isReady, setClass } from './js/utils';
import { MediaController } from './js/media'
import { StateController } from './js/state'

const presetStates = [
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
            articles: container.querySelectorAll('article'),
            progress: document.getElementById('progress-bar'),
            next: document.getElementById('next'),
            back: document.getElementById('back')
        }
        const count = dom.articles.length

        // Preload all the videos into a controller to manage them and
        // ensure that they have loaded fully 
        const media = await MediaController(
            presetStates.filter(p => !!p.video).map(p => p.video)
        )

        // When the media is preloaded, make the container visible
        setClass(dom.container, 'active')

        // UI updates to make before the transition is complete
        const updateBeforeTransition = (index) => {
            setClass(dom.container, 'transition', true)
            dom.progress.style.transform = `scale(1.0, ${1 / count}) translateY(${index * 100}%)`
            for (let i = 0; i < count; i++) {
                setClass(dom.articles[i], 'active', index === i)
            }
        }

        // UI updates to make after the transition is complete
        const updateAfterTransition = (index, { canNavigateForward, canNavigateBack }, newState) => {
            if (newState.next) dom.next.innerText = newState.next
            setClass(dom.next, 'active', canNavigateForward)
            setClass(dom.back, 'active', canNavigateBack)

            for (let i = 0; i < count; i++) {
                dom.articles[i].style.opacity = i <= index ? 1.0 : 0.0
            }
            setClass(dom.container, 'transition', false)
        }

        StateController({
            count,
            initialIndex: 0,
            onCreated: ({
                state: {
                    canNavigateForward,
                    canNavigateBack,
                    index
                },
                next,
                previous
            }) => {
                // setup event listeners for the UI
                dom.next.addEventListener('click', next)
                dom.back.addEventListener('click', previous)

                updateBeforeTransition(index)
                updateAfterTransition(index, {
                    canNavigateForward,
                    canNavigateBack,
                }, presetStates[index])
            },
            onChange: async ({
                state: {
                    index,
                    canNavigateForward,
                    canNavigateBack
                },
                prevIndex,
                delta
            }) => {
                updateBeforeTransition(index)

                if (delta === -1) {
                    await media.resetAll()
                } else {
                    await media.play(presetStates[prevIndex].video)
                }
                updateAfterTransition(index, { canNavigateForward, canNavigateBack }, presetStates[index])
            }
        })
    } catch (e) {
        console.log(e)
    }
});
