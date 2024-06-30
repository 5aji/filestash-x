import { createElement, createRender } from "../../lib/skeleton/index.js";
import rxjs, { effect, onLoad } from "../../lib/rx.js";
import { animate } from "../../lib/animate.js";
import { loadCSS } from "../../helpers/loader.js";
import { qs } from "../../lib/dom.js";
import { createLoader } from "../../components/loader.js";
import ctrlError from "../ctrl_error.js";

import { transition, getFilename, getDownloadUrl } from "./common.js";

import componentMetadata from "./application_image_metadata.js";
import componentPager, { init as initPager } from "./component_pager.js";

import { renderMenubar, buttonDownload } from "./component_menubar.js";

export default function(render) {
    const $page = createElement(`
        <div class="component_imageviewer">
            <component-menubar></component-menubar>
            <div class="component_image_container">
                <div class="images_wrapper">
                    <img class="photo idle hidden" draggable="true" src="${getDownloadUrl()}">
                </div>
                <div class="images_aside scroll-y"></div>
                <div class="component_pager hidden"></div>
            </div>
        </div>
    `);
    render($page);
    renderMenubar(
        qs($page, "component-menubar"),
        buttonDownload(getFilename(), getDownloadUrl()),
        buttonFullscreen({ onclick: () => {
            const $container = qs($page, ".component_image_container");
            if ("webkitRequestFullscreen" in document.body) {
                $container.webkitRequestFullscreen();
            } else if ("mozRequestFullScreen" in document.body) {
                $container.mozRequestFullScreen();
            }
        }}),
    );
    transition(qs($page, ".component_image_container"));

    const removeLoader = createLoader(qs($page, ".images_wrapper"));
    const $photo = qs($page, "img.photo");
    effect(onLoad($photo).pipe(
        removeLoader,
        rxjs.tap(($node) => {
            $node.classList.remove("hidden");
            animate($node, {
                time: 300,
                easing: "cubic-bezier(.51,.92,.24,1.15)",
                keyframes: [
                    { opacity: 0, transform: "scale(.97)" },
                    { opacity: 1 },
                    { opacity: 1, transform: "scale(1)" },
                ],
            });
        }),
        rxjs.catchError((err) => {
            if (err.target instanceof window.HTMLElement && err.type === "error") {
                return rxjs.of($photo).pipe(
                    removeLoader,
                    rxjs.tap(($img) => {
                        $img.setAttribute("src", "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgaGVpZ2h0PSIxNiIKICAgd2lkdGg9IjE2IgogICB2ZXJzaW9uPSIxLjEiCiAgIGlkPSJzdmcyNzU2IgogICBzb2RpcG9kaTpkb2NuYW1lPSJkb3dubG9hZC5zdmciCiAgIGlua3NjYXBlOnZlcnNpb249IjEuMi4yIChiMGE4NDg2NTQxLCAyMDIyLTEyLTAxKSIKICAgeG1sbnM6aW5rc2NhcGU9Imh0dHA6Ly93d3cuaW5rc2NhcGUub3JnL25hbWVzcGFjZXMvaW5rc2NhcGUiCiAgIHhtbG5zOnNvZGlwb2RpPSJodHRwOi8vc29kaXBvZGkuc291cmNlZm9yZ2UubmV0L0RURC9zb2RpcG9kaS0wLmR0ZCIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcwogICAgIGlkPSJkZWZzMjc2MCIgLz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgaWQ9Im5hbWVkdmlldzI3NTgiCiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjMDAwMDAwIgogICAgIGJvcmRlcm9wYWNpdHk9IjAuMjUiCiAgICAgaW5rc2NhcGU6c2hvd3BhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6cGFnZW9wYWNpdHk9IjAuMCIKICAgICBpbmtzY2FwZTpwYWdlY2hlY2tlcmJvYXJkPSIwIgogICAgIGlua3NjYXBlOmRlc2tjb2xvcj0iI2QxZDFkMSIKICAgICBzaG93Z3JpZD0iZmFsc2UiCiAgICAgaW5rc2NhcGU6em9vbT0iNDEuNzE5MyIKICAgICBpbmtzY2FwZTpjeD0iMTEuMzI1NjkzIgogICAgIGlua3NjYXBlOmN5PSI4LjU1NzE5MDUiCiAgICAgaW5rc2NhcGU6d2luZG93LXdpZHRoPSIxOTA0IgogICAgIGlua3NjYXBlOndpbmRvdy1oZWlnaHQ9IjExNTciCiAgICAgaW5rc2NhcGU6d2luZG93LXg9IjciCiAgICAgaW5rc2NhcGU6d2luZG93LXk9IjM0IgogICAgIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjEiCiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0ic3ZnMjc1NiIgLz4KICA8cGF0aAogICAgIHN0eWxlPSJjb2xvcjojMDAwMDAwO3RleHQtaW5kZW50OjA7dGV4dC10cmFuc2Zvcm06bm9uZTtmaWxsOiMzYjQwNDU7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlLXdpZHRoOjAuOTg0ODEwNDEiCiAgICAgZD0ibSAyLDEzLjA4MjQxMiAwLjAxOTQ2MiwxLjQ5MjM0NyBjIDVlLTYsMC4yMjIxNDUgMC4yMDU1OTAyLDAuNDI0MjYyIDAuNDMxMTUwMiwwLjQyNDI3MiBMIDEzLjU4OTYxMiwxNSBDIDEzLjgxNTE3MywxNC45OTk5OTUgMTMuOTk5OTksMTQuNzk3ODc0IDE0LDE0LjU3NTcyOSB2IC0xLjQ5MzMxNyBjIC00LjE3MTg2OTIsMC42NjIwMjMgLTcuNjUxNjkyOCwwLjM5ODY5NiAtMTIsMCB6IgogICAgIGlkPSJwYXRoMjc1MCIgLz4KICA8cGF0aAogICAgIHN0eWxlPSJjb2xvcjojMDAwMDAwO3RleHQtaW5kZW50OjA7dGV4dC10cmFuc2Zvcm06bm9uZTtkaXNwbGF5OmlubGluZTtmaWxsOiNmOWY5ZmE7c3Ryb2tlLXdpZHRoOjAuOTg0MDgxMjc7ZmlsbC1vcGFjaXR5OjEiCiAgICAgZD0iTSAyLjM1MDEsMS4wMDEzMzEyIEMgMi4xNTI1OSwxLjAzODMyNDcgMS45OTY1OSwxLjIyNzI3MjMgMi4wMDAwOSwxLjQyNDkzNTYgViAxNC4xMzM0NTcgYyA1ZS02LDAuMjIxODE2IDAuMjA1MjMsMC40MjM2MzQgMC40MzA3OSwwLjQyMzY0NCBsIDExLjEzOSwtMS4wMWUtNCBjIDAuMjI1NTYsLTZlLTYgMC40MzAxMSwtMC4yMDA3NTggMC40MzAxMiwtMC40MjI1NzQgbCA2LjdlLTQsLTkuODIyNjQyNiBjIC0yLjQ4NDA0NiwtMS4zNTUwMDYgLTIuNDM1MjM0LC0yLjAzMTIyNTQgLTMuNTAwMSwtMy4zMDk3MDcgLTAuMDQzLC0wLjAxNTg4MiAwLjA0NiwwLjAwMTc0IDAsMCBMIDIuNDMwNjcsMS4wMDExMDggQyAyLjQwMzgzLDAuOTk4NTkgMi4zNzY3NCwwLjk5ODU5IDIuMzQ5OSwxLjAwMTEwOCBaIgogICAgIGlkPSJwYXRoMjc1MiIgLz4KICA8cGF0aAogICAgIHN0eWxlPSJkaXNwbGF5OmlubGluZTtmaWxsOiMzYjQwNDU7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOiM5ZTc1NzU7c3Ryb2tlLXdpZHRoOjA7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDtzdHJva2UtZGFzaGFycmF5Om5vbmU7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICBkPSJtIDEwLjUwMDU3LDEuMDAyMDc2NCBjIDAsMy4yNzY4MDI4IC0wLjAwNTIsMy4xNzM5MTYxIDAuMzYyOTIxLDMuMjY5ODIwMiAwLjI4MDEwOSwwLjA3Mjk4NCAzLjEzNzE4LDAuMDM5ODg3IDMuMTM3MTgsMC4wMzk4ODcgLTEuMTIwMDY3LC0xLjA1NTY2OTIgLTIuMzMzNCwtMi4yMDY0NzEzIC0zLjUwMDEsLTMuMzA5NzA3NCB6IgogICAgIGlkPSJwYXRoMjc1NCIgLz4KPC9zdmc+Cg==");
                        $img.classList.remove("hidden");
                        $img.classList.add("error");
                        $img.parentElement.appendChild(createElement(`
                            <div class="error no-select">
                                This file format is not supported
                            </div>
                        `));
                    }),
                    rxjs.catchError(ctrlError()),
                );
            }
            return ctrlError()(err);
        }),
    ));

    componentMetadata(createRender(qs($page, ".images_aside")));
    componentPager(createRender(qs($page, ".component_pager")));
}

const buttonFullscreen = ({ onclick }) => {
    const $el = createElement(`
        <span>
            <img class="component_icon" draggable="false" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MzguNTQzIDQzOC41NDMiPgogIDxnIHRyYW5zZm9ybT0ibWF0cml4KDAuNzI5LDAsMCwwLjcyOSw1OS40MjI1NzYsNTkuNDIyNDQxKSI+CiAgICA8cGF0aCBzdHlsZT0iZmlsbDojZjJmMmYyO2ZpbGwtb3BhY2l0eToxIiBkPSJtIDQwNy40MiwxNTkuMDI5IGMgMy42MiwzLjYxNiA3Ljg5OCw1LjQyOCAxMi44NDcsNS40MjggMi4yODIsMCA0LjY2OCwtMC40NzYgNy4xMzksLTEuNDI5IDcuNDI2LC0zLjIzNSAxMS4xMzYsLTguODUzIDExLjEzNiwtMTYuODQ2IFYgMTguMjc2IGMgMCwtNC45NDkgLTEuODA3LC05LjIzMSAtNS40MjgsLTEyLjg0NyAtMy42MSwtMy42MTcgLTcuODk4LC01LjQyNCAtMTIuODQ3LC01LjQyNCBIIDI5Mi4zNiBjIC03Ljk5MSwwIC0xMy42MDcsMy44MDUgLTE2Ljg0OCwxMS40MTkgLTMuMjMsNy40MjMgLTEuOTAyLDEzLjk5IDQsMTkuNjk4IEwgMzIwLjYyMyw3Mi4yMzQgMjE5LjI3MSwxNzMuNTg5IDExNy45MTcsNzIuMjMxIDE1OS4wMjksMzEuMTE5IGMgNS45MDEsLTUuNzA4IDcuMjMyLC0xMi4yNzUgMy45OTksLTE5LjY5OCBDIDE1OS43ODksMy44MDcgMTU0LjE3NSwwIDE0Ni4xODIsMCBIIDE4LjI3NiBDIDEzLjMyNCwwIDkuMDQxLDEuODA5IDUuNDI1LDUuNDI2IDEuODA4LDkuMDQyIDAuMDAxLDEzLjMyNCAwLjAwMSwxOC4yNzMgViAxNDYuMTggYyAwLDcuOTk2IDMuODA5LDEzLjYxIDExLjQxOSwxNi44NDYgMi4yODUsMC45NDggNC41NywxLjQyOSA2Ljg1NSwxLjQyOSA0Ljk0OCwwIDkuMjI5LC0xLjgxMiAxMi44NDcsLTUuNDI3IEwgNzIuMjM0LDExNy45MTkgMTczLjU4OCwyMTkuMjczIDcyLjIzNCwzMjAuNjIyIDMxLjEyMiwyNzkuNTA5IGMgLTUuNzExLC01LjkwMyAtMTIuMjc1LC03LjIzMSAtMTkuNzAyLC00LjAwMSAtNy42MTQsMy4yNDEgLTExLjQxOSw4Ljg1NiAtMTEuNDE5LDE2Ljg1NCB2IDEyNy45MDYgYyAwLDQuOTQ4IDEuODA3LDkuMjI5IDUuNDI0LDEyLjg0NyAzLjYxOSwzLjYxNCA3LjkwMiw1LjQyMSAxMi44NTEsNS40MjEgaCAxMjcuOTA2IGMgNy45OTYsMCAxMy42MSwtMy44MDYgMTYuODQ2LC0xMS40MTYgMy4yMzQsLTcuNDI3IDEuOTAzLC0xMy45OSAtMy45OTksLTE5LjcwNSBMIDExNy45MTcsMzY2LjMwOSAyMTkuMjcxLDI2NC45NSAzMjAuNjI0LDM2Ni4zMTEgMjc5LjUxLDQwNy40MjEgYyAtNS44OTksNS43MDggLTcuMjI4LDEyLjI3OSAtMy45OTcsMTkuNjk4IDMuMjM3LDcuNjE3IDguODU2LDExLjQyMyAxNi44NTEsMTEuNDIzIGggMTI3LjkwNyBjIDQuOTQ4LDAgOS4yMzIsLTEuODEzIDEyLjg0NywtNS40MjggMy42MTMsLTMuNjEzIDUuNDIsLTcuODk4IDUuNDIsLTEyLjg0NyBWIDI5Mi4zNjIgYyAwLC03Ljk5NCAtMy43MDksLTEzLjYxMyAtMTEuMTM2LC0xNi44NTEgLTcuODAyLC0zLjIzIC0xNC40NjIsLTEuOTAzIC0xOS45ODUsNC4wMDQgTCAzNjYuMzExLDMyMC42MjEgMjY0Ljk1MiwyMTkuMjcxIDM2Ni4zMSwxMTcuOTE3IFoiIC8+CiAgPC9nPgo8L3N2Zz4K" alt="fullscreen">
        </span>
    `);
    $el.onclick = onclick;
    return $el;
};

export function init() {
    return Promise.all([
        loadCSS(import.meta.url, "./application_image.css"),
        initPager(), // initMetadata(),
    ]);
}
