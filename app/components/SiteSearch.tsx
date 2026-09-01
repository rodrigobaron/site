'use client'

import type * as React from 'react'
import { useEffect } from 'react'
import { Search } from 'nextra/components'

import '../../styles/search.css'

/** Keys that move the highlight, as opposed to the pointer hovering a row. */
const NAV_KEYS = new Set([
    'ArrowDown',
    'ArrowUp',
    'Home',
    'End',
    'PageDown',
    'PageUp'
])

/**
 * Height of the sticky group header, so a row scrolled to the top of the list
 * does not end up underneath it. Matches `div.x:uppercase` in search.css:
 * 6px + 6px padding plus a 10px line.
 */
const STICKY_HEADER_INSET = 28

/**
 * Keep the highlighted result inside the visible part of the panel.
 *
 * Headless UI 2.2.0 ships a ComboboxOption effect that is supposed to do this,
 * but it never fires for Nextra's combobox: arrowing down past the sixth
 * result moves `data-focus` onto rows that stay scrolled out of sight
 * (verified in Chrome — the active option advanced to index 19 while the
 * panel's scrollTop stayed at 0, with this stylesheet disabled as well as
 * enabled, so it is not a styling side effect).
 *
 * This deliberately does not call scrollIntoView(). That method walks up every
 * scrollable ancestor and would move the document itself if the panel were
 * ever positioned off-screen. Doing the arithmetic on one element's scrollTop
 * cannot move the page, whatever else is going on with the document scroller.
 */
function useVisibleActiveOption(): void {
    useEffect(() => {
        // Headless UI also sets data-focus on hover; following that with a
        // scroll would fight the pointer. Only react to keyboard navigation.
        let keyboardNav = false
        const onKeyDown = (event: KeyboardEvent) => {
            if (NAV_KEYS.has(event.key)) keyboardNav = true
        }
        const onPointerMove = () => {
            keyboardNav = false
        }

        const reveal = (option: HTMLElement) => {
            const panel = option.closest<HTMLElement>('.nextra-search-results')
            if (!panel) return
            const top = option.offsetTop - STICKY_HEADER_INSET
            const bottom = option.offsetTop + option.offsetHeight
            if (top < panel.scrollTop) {
                panel.scrollTop = top
            } else if (bottom > panel.scrollTop + panel.clientHeight) {
                panel.scrollTop = bottom - panel.clientHeight
            }
        }

        const observer = new MutationObserver(records => {
            if (!keyboardNav) return
            for (const record of records) {
                const target = record.target as HTMLElement
                if (target.hasAttribute('data-focus')) reveal(target)
            }
        })

        window.addEventListener('keydown', onKeyDown, true)
        window.addEventListener('pointermove', onPointerMove, true)
        observer.observe(document.body, {
            subtree: true,
            attributeFilter: ['data-focus']
        })

        return () => {
            window.removeEventListener('keydown', onKeyDown, true)
            window.removeEventListener('pointermove', onPointerMove, true)
            observer.disconnect()
        }
    }, [])
}

/**
 * Empty and unfocus the search box on Escape.
 *
 * Nextra clears its `search` state only inside handleSelect (search.js:185),
 * and Headless UI calls preventDefault on Escape, which also suppresses
 * Chrome's native clear for <input type="search">. Left alone, Escape closes
 * the panel but leaves the old query in a still-focused input, so the next
 * ⌘K lands on stale text.
 *
 * Clearing is done the way a user would: write through HTMLInputElement's own
 * value setter, then fire `input`. That is the only route that gets past
 * React's value tracker, so React's onChange runs and Nextra's state follows.
 * Nothing here reads Nextra or Headless UI internals.
 *
 * The listener is capture-phase because Headless UI's own Escape handler
 * calls stopPropagation while the panel is open, so a bubble-phase listener
 * above the React root never sees the key. Blurring closes the combobox
 * through Headless UI's blur path, which pops its scroll lock properly.
 */
function useEscapeClearsSearch(): void {
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return
            const input =
                document.querySelector<HTMLInputElement>('.nextra-search input')
            if (!input || document.activeElement !== input) return

            const setValue = Object.getOwnPropertyDescriptor(
                HTMLInputElement.prototype,
                'value'
            )?.set
            setValue?.call(input, '')
            input.dispatchEvent(new Event('input', { bubbles: true }))
            input.blur()
        }

        window.addEventListener('keydown', onKeyDown, true)
        return () => window.removeEventListener('keydown', onKeyDown, true)
    }, [])
}

/**
 * The navbar search box and its results panel.
 *
 * Nextra's <Search> is kept as-is — it owns the Pagefind wiring, the ⌘K and
 * "/" shortcuts and the Headless UI combobox. This wrapper exists to import
 * styles/search.css (nothing else does) and to replace Nextra's three default
 * status strings with copy written for this site.
 *
 * Each status is one bright headline plus one dim line of guidance, so
 * loading, empty and error all read as the same kind of object.
 */
export function SiteSearch(): React.JSX.Element {
    useVisibleActiveOption()
    useEscapeClearsSearch()

    return (
        <Search
            placeholder='Search content...'
            loading={
                <span className='site-search-note'>loading index…</span>
            }
            emptyResult={
                <span className='site-search-note'>
                    no matches
                    <span className='site-search-hint'>try fewer words</span>
                </span>
            }
            errorText={
                <span className='site-search-note site-search-note-error'>
                    search index unavailable
                    <span className='site-search-hint'>
                        reload the page; if it persists, this build has no index
                    </span>
                </span>
            }
        />
    )
}
