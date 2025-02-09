
exports.main = function (JSONREP, node, options) {


    return JSONREP.makeRep(
        (
            '<div class="inspector">' + 
                '<div class="close" style="display: none;">x</div>' +
                '<div class="viewer"></div>' +
            '</div>'
        ),
        {
            css: (css () >>>

                :scope.inspector {
                    padding: 10px;
                }

                :scope.inspector > .close {
                    border: 1px solid #dcdcdc;
                    font-weight: bold;
                    float: right;
                    cursor: pointer;
                    padding: 2px;
                    line-height: 10px;
                }

                :scope.inspector > .viewer {
                    height: 100%;
                }                    
                
            <<<),
            on: {
                mount: function (el) {

                    const COMPONENT = require("./component");
    
                    const comp = COMPONENT.for({
                        browser: browser
                    });

                    comp.on("setting.enabled", function (enabled) {
                        if (!enabled) {
                            clearContent();
                        }
                    });

                    comp.on("changed.context", function (context) {
                        comp.contextChangeAcknowledged();

                        clearContent();
                    });
                    
                    comp.on("message", function (message) {
                        try {
                            if (message.event === "clear") {
                                clearContent();
                            } else
                            if (message.event === "destroyContext") {
                                if (
                                    comp.currentContext &&
                                    comp.currentContext.tabId == message.context.tabId
                                ) {
                                    clearContent();
                                }
                            }
                        } catch (err) {
                            console.error(err);
                            throw err;
                        }
                    });

                    function clearContent () {
                        var panelEl = el.querySelector('.viewer');
                        panelEl.style.display = "none";
                        el.querySelector(".close").style.display = "none";
                    }

                    function showMessage (message) {
                        var panelEl = el.querySelector('.viewer');
                        window.FC.renderMessageInto(panelEl, message);
                        panelEl.style.display = "";
                        el.querySelector(".close").style.display = "inline-block";
                    }

                    el.querySelector(".close").addEventListener("click", clearContent, false);


                    window.FC.on("inspectMessage", function (info) {
                        delete info.node.meta.wrapper;
                        showMessage(info.node);
                    });

                    window.FC.on("inspectNode", function (info) {
                        showMessage(info.node);
                    });
                        
                    window.FC.on("inspectFile", function (info) {
                        showMessage({
                            type: "string",
                            value: "Viewing of files is not yet implemented."
                        });
                    });




/*                    
                    function makeKeyForCurrentContext () {
                        return comp.currentContext.id.replace(/["\{\}]/g, '_');//tabId + ":" + (context.url || "");
                    }

                    function getPanel () {
                        if (!currentContext) {
                            return;
                        }
                        var key = makeKeyForContext(currentContext);
                        var panelEl = el.querySelector('.viewer > DIV[context="' + key + '"]');
                        if (!panelEl) {
                            panelEl = window.document.createElement('div');
                            panelEl.setAttribute("context", key);
                            panelEl.style.display = "none";
                            el.querySelector('.viewer').appendChild(panelEl);
                        }
                        return panelEl;                                                
                    }

                    function hidePanel () {
                        if (!currentContext) {
                            return;
                        }
                        var key = makeKeyForContext(currentContext);
                        var panelEl = el.querySelector('.viewer > DIV[context="' + key + '"]');
                        if (!panelEl) {
                            return;
                        }
                        panelEl.style.display = "none";
                        el.querySelector(".close").style.display = "none";
                    }

                    function showPanel () {

                        if (!currentContext) {
                            return;
                        }
                        var key = makeKeyForContext(currentContext);

                        var panelEl = el.querySelector('.viewer > DIV[context="' + key + '"]');

                        if (!panelEl) {
                            return;
                        }
                        panelEl.style.display = "";
                        el.querySelector(".close").style.display = "inline-block";
                    }

                    function destroyPanel () {
                        if (!currentContext) {
                            return;
                        }
                        var key = makeKeyForContext(currentContext);
                        var panelEl = el.querySelector('.viewer > DIV[context="' + key + '"]');
                        if (!panelEl) {
                            return;
                        }
                        panelEl.parentNode.removeChild(panelEl);
                        el.querySelector(".close").style.display = "none";
                    }


                    window.FC.on("inspectMessage", function (info) {

                        hidePanel();

                        if (info.message.context) {
                            currentContext = info.message.context;
                        }

//console.log("INSPECT MESSAGE!!", info.message);

                        const panel = getPanel();

                        if (!panel) return;

                        delete info.message.meta.wrapper;

                        window.FC.renderMessageInto(panel, info.message);
                        
                        showPanel();
                    });

                    window.FC.on("inspectNode", function (info) {

                        hidePanel();

                        if (info.message.context) {
                            currentContext = info.message.context;
                        }
                        
                        currentContext = {
                            tabId: browser.devtools.inspectedWindow.tabId
                        };

                        const panel = getPanel();

                        if (!panel) return;
                        
                        window.FC.renderMessageInto(panel, info.message);
                        
                        showPanel();
                    });
                        
                    window.FC.on("inspectFile", function (info) {

                        const panel = getPanel();

                        if (!panel) return;

                        window.FC.renderMessageInto(panel, {
                            type: "string",
                            value: "Viewing of files is not yet implemented."
                        });
                    });

                    el.querySelector(".close").addEventListener("click", destroyPanel, false);
*/
                }
            }
        },
        options
    );
};
        