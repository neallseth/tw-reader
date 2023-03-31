import { parse } from "node-html-parser";
import { decode } from "html-entities";
import { JSDOM } from "jsdom";

export function microdataParse(html) {
  const rootNode = parse(html);
  const metadata = collectMetadata(rootNode);
  return metadata;
  function collectMetadata(node) {
    return recurseMeta(node, { children: [] }).children[0];
    function recurseMeta(node, currentScope) {
      const isScopeLevel = node.attributes?.hasOwnProperty("itemscope");
      if (isScopeLevel) {
        const newScope = {
          scope: node.getAttribute("itemtype") || "anonymous",
          metadata: {},
        };
        if (!currentScope.children) {
          currentScope.children = [];
        }
        currentScope.children.push(newScope);
        node.childNodes.forEach((node) => recurseMeta(node, newScope));
      } else {
        if (node.getAttribute?.("itemprop")) {
          const itemprop = node.getAttribute("itemprop");
          const itemval = decode(
            node.getAttribute("content") || node.innerText
          );
          currentScope.metadata[itemprop] = itemval;
        }
        node.childNodes.forEach((node) => recurseMeta(node, currentScope));
      }
      return currentScope;
    }
  }
}

export function microdataParseJSDOM(html, options) {
  const { window } = new JSDOM(html, { ...options });
  const metadata = collectMetadata(window.document.body);
  return metadata;

  function collectMetadata(node) {
    return recurseMeta(node, { children: [] }).children[0];

    function recurseMeta(node, currentScope) {
      const isScopeLevel = node.attributes?.hasOwnProperty("itemscope");
      if (isScopeLevel) {
        const newScope = {
          scope: node.getAttribute("itemtype") || "anonymous",
          metadata: {},
        };
        if (!currentScope.children) {
          currentScope.children = [];
        }
        currentScope.children.push(newScope);
        node.childNodes.forEach((node) => recurseMeta(node, newScope));
      } else {
        if (node.getAttribute?.("itemprop")) {
          const itemprop = node.getAttribute("itemprop");
          const itemval = node.getAttribute("content") || node.textContent;
          currentScope.metadata[itemprop] = itemval;
        }
        node.childNodes.forEach((node) => recurseMeta(node, currentScope));
      }
      return currentScope;
    }
  }
}
