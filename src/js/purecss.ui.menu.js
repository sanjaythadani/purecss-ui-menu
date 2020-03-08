(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory(root));
    } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        // CommonJS
        module.exports = factory(root);
    } else {
        // Browser globals
        root.pu = root.pu || {};
        root.pu.menu = factory(root);
    }
}(typeof window !== "undefined" ? window : this, function(root) {
    let addEventListener = window.addEventListener;
    if (!addEventListener) console.error('purecss-ui-dialog requires a window with events');

    let document = root.document;
    if (!document) console.error('purecss-ui-dialog requires a window with a document');

    // verify that Element.matches is defined
    let Element = root.Element;
    if (!Element.prototype.matches) Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;

    function init() {
        window.addEventListener('click', menuHandler);
        window.addEventListener('resize', resetMenu);
    }

    function resetMenu(e) {
        let openDropdownNodes = Array.apply(null, document.querySelectorAll('.pure-menu .open, .pure-menu.collapse-open'));
        openDropdownNodes.forEach(n => { n.classList.remove('open', 'open-right', 'open-left', 'collapse-open'); });
        let subMenuNodes = Array.apply(null, document.querySelectorAll('.sub-menu-content'));
        subMenuNodes.forEach(n => { n.style.marginLeft = ""; });
    }

    function menuHandler(e) {
        let target = e.target;

        if (target.classList.contains('menu-toggle-button')) {
            let parentMenu = getMenuParent(target);
            if (parentMenu) {
                if (parentMenu.classList.contains('collapse-open')) parentMenu.classList.remove('collapse-open');
                else parentMenu.classList.add('collapse-open');
                // hack to postion css grid elements in IE11
                if (!!navigator.userAgent.match(/Trident.*rv[ :]*11\./)) {
                    let gridNodes = Array.apply(null, parentMenu.querySelectorAll('.pure-g, .menu-collapse'));
                    gridNodes.forEach(gridNode => {
                        let gridItemNodes = Array.apply(null, gridNode.childNodes);
                        gridItemNodes.forEach((gridItemNode, i) => {
                            if (gridItemNode.style) gridItemNode.style.msGridRow = (i + 1).toString();
                        });
                    });
                }
            }
        } else {
            let targetParent = e.target.parentNode;
            let targetSubMenuAncestors = getSubMenuParents(target);
            let openDropdownNodes = Array.apply(null, document.querySelectorAll('.pure-menu-item.sub-menu.open'));

            if (targetSubMenuAncestors.length == 0) {
                // click on non dropdown element so close all
                openDropdownNodes.forEach(n => { n.classList.remove('open', 'open-right', 'open-left'); });
            } else if (targetSubMenuAncestors.length == 1) {
                // click on top level dropdown so open if closed
                if (targetParent === targetSubMenuAncestors[0]) {
                    targetParent.classList.add('open');
                    // detect right bound
                    let subMenuContent = targetParent.getElementsByClassName('sub-menu-content')[0];
                    if (subMenuContent) {
                        let rightBound = getRightBound(subMenuContent.dataset.rightBound);
                        let targetParentDims = targetParent.getBoundingClientRect();
                        let subMenuContentDims = subMenuContent.getBoundingClientRect();
                        let contentRight = subMenuContentDims.right;
                        if (contentRight > rightBound) {
                            let shiftLeft = Math.ceil(contentRight - rightBound);
                            subMenuContent.style.marginLeft = '-' + shiftLeft + 'px';
                        }
                        if (subMenuContentDims.width < targetParentDims.width) {
                            subMenuContent.style.width = Math.ceil(targetParentDims.width).toString() + 'px';
                        }
                    }
                }
                // else close all dropdowns
                openDropdownNodes.forEach(n => { n.classList.remove('open', 'open-right', 'open-left'); });
            } else {
                if (targetParent === targetSubMenuAncestors[0]) {
                    // click on child level dropdown so toggle 
                    if (targetParent.classList.contains('open')) {
                        targetParent.classList.remove('open', 'open-right', 'open-left');
                    } else {
                        targetParent.classList.add('open');
                        // detect edge and place left or right of parent
                        let subMenuContent = targetParent.getElementsByClassName('sub-menu-content')[0];
                        if (subMenuContent) {
                            let rightBound = getRightBound(subMenuContent.dataset.rightBound);
                            let targetParentDims = targetParent.getBoundingClientRect();
                            let subMenuContentDims = subMenuContent.getBoundingClientRect();
                            if ((targetParentDims.right + subMenuContentDims.width) > rightBound) {
                                targetParent.classList.add('open-left');
                            } else {
                                targetParent.classList.add('open-right');
                            }
                        }
                    }
                    // close any dropdowns not in the ancestors of this dropdown
                    openDropdownNodes.forEach(n => { if (targetSubMenuAncestors.indexOf(n) == -1) n.classList.remove('open', 'open-right', 'open-left'); });
                } else {
                    // click is on link so close all
                    openDropdownNodes.forEach(n => { n.classList.remove('open', 'open-right', 'open-left'); });
                }
            }

            if (target.classList.contains('sub-menu') || targetParent.classList.contains('sub-menu')) {
                e.stopPropagation();
                e.preventDefault();
            }
        }

        function getMenuParent(node) {
            let parent = null;
            for (; node && node !== document; node = node.parentNode) {
                if (node.matches('.pure-menu.pure-menu-horizontal')) parent = node;
            }
            return parent;
        }

        function getSubMenuParents(node) {
            let nodes = [];
            for (; node && node !== document; node = node.parentNode) {
                if (node.matches('.pure-menu-item.sub-menu')) nodes.push(node);
            }
            return nodes;
        }

        function getRightBound(rightBoundId) {
            let bodyDims = document.body.getBoundingClientRect();
            let rightBound = bodyDims.right;
            if (rightBoundId) {
                let specifiedRightBound = document.getElementById(rightBoundId);
                if (specifiedRightBound) {
                    let specifiedRightBoundDims = specifiedRightBound.getBoundingClientRect();
                    rightBound = specifiedRightBoundDims.right;
                }
            }
            return rightBound;
        }
    }

    let menu = {
        init: init
    };

    return menu;
}));