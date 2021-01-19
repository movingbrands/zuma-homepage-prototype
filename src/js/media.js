import { delay } from './utils';

// Preloads a video or img element (provided it has a valid src)
const preloadMediaItem = (id) =>
    new Promise(async (resolve, reject) => {
        try {
            const element = document.querySelector(id)
            if (!element && (!element.src || !element.currentSrc))
                throw `Invalid DOM element: ${id}`

            const res = await fetch(element.currentSrc || element.src)
            const blob = await res.blob()

            if (blob.size === 0)
                throw `Invalid media element: ${id} `

            resolve({ id, element })
        } catch (e) {
            reject(e)
        }
    })

// A simple way of managing a list of media and controlling their
// play state centrally
export const MediaController = (targets) =>
    new Promise(async (resolve, reject) => {
        try {
            const items = {}

            const preloaded = await Promise.all(targets.map(preloadMediaItem))

            preloaded.forEach(({ id, element }) => {
                items[id] = element
            })

            const play = async (id) => {
                const isPlaying = !!(items[id].currentTime > 0 && !items[id].paused && !items[id].ended && items[id].readyState > 2);

                if (isPlaying) {
                    items[id].pause()
                    items[id].currentTime = 0
                }
                items[id].play()
                await delay(Math.floor(items[id].duration * 1000))
            }

            const reset = async (id) => {
                items[id].pause()
                items[id].currentTime = 0
            }

            resolve({
                play,
                reset,
                resetAll: () => Promise.all(targets.map(reset))
            })
        } catch (e) {
            reject(e)
        }
    })