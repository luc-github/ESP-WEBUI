/*
 index.js - ESP3D WebUI helpers file

 Copyright (c) 2021 Alexandre Aussourd. All rights reserved.
 Modified by Luc LEBOSSE 2021
 
 This code is free software; you can redistribute it and/or
 modify it under the terms of the GNU Lesser General Public
 License as published by the Free Software Foundation; either
 version 2.1 of the License, or (at your option) any later version.
 This code is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 Lesser General Public License for more details.
 You should have received a copy of the GNU Lesser General Public
 License along with This code; if not, write to the Free Software
 Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/
import { h } from "preact";

const capitalize = (s) =>
  typeof s === "string" ? s.charAt(0).toUpperCase() + s.slice(1) : "";

const getColClasses = ({ col, ...responsive }) => {
  const responsiveClasses = Object.keys(responsive).reduce(
    (acc, key, i) => (i == 0 ? acc : `${acc} col-${key}-${responsive[key]}`),
    ""
  );
  return `col-${col} ${responsiveClasses}`;
};

const parseFileSizeString = (sizeString) => {
  const [size, unit] = sizeString.split(" ");
  const parsedSize = parseFloat(size);
  switch (unit) {
    case "B":
      return parsedSize;
    case "KB":
      return parsedSize * 1e3;
    case "MB":
      return parsedSize * 1e6;
    case "GB":
      return parsedSize * 1e9;
    case "TB":
      return parsedSize * 1e12;
    default:
      return undefined;
  }
};

const generateUID = () => Math.random().toString(36).substr(2, 9);

const removeEntriesByIDs = (src, uid) =>
  src.filter(({ id }) => !uid.includes(id));

const mergeFlatPrefToNestedSchema = (settings, schema) => {
  return Object.keys(schema).reduce(
    (acc, key) => {
      if ("fields" in schema[key])
        return {
          ...acc,
          [key]: {
            ...schema[key],
            value: settings[key],
            fields: mergeFlatPrefToNestedSchema(settings, schema[key].fields),
          },
        };
      return { ...acc, [key]: { ...schema[key], value: settings[key] } };
    },
    { ...schema }
  );
};

const createComponent = (is, className, classModifier = {}) => ({
  is: Tag = is,
  class: c = "",
  id = "",
  ...props
}) => {
  const splittedArgs = Object.keys(props).reduce(
    (acc, curr) => {
      if (Object.keys(classModifier).includes(curr))
        return { classes: [...acc.classes, classModifier[curr]], ...acc.props };
      return {
        classes: [...acc.classes],
        props: { ...acc.props, [curr]: props[curr] },
      };
    },
    { classes: [], props: {} }
  );
  const classNames = `${className} ${splittedArgs.classes.join(
    " "
  )} ${c}`.trim();
  return <Tag class={classNames} id={id} {...splittedArgs.props} />;
};

const hslToHex = (h, s, l) => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0"); // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

const limitArr = (arr, limit) =>
  arr.slice(
    arr.length - (arr.length <= limit ? arr.length : limit),
    arr.length
  );

//generate an URL with server host and base address
//args is array of argumments: [{'cmd':'[ESP800]},...]
const espHttpURL = (base = "", args) => {
  const url = new URL("http://" + window.location.host + "/" + base);
  if (args)
    Object.keys(args).forEach((key) => {
      url.searchParams.append(key, args[key]);
    });
  return url;
};

//Merge 2 JSON in generic way
//based on https://gist.github.com/sinemetu1/1732896#gistcomment-2571586
function mergeJSON(o1, o2) {
  let tempNewObj = o1;
  if (o1.length === undefined && typeof o1 !== "number") {
    for (let key in o2) {
      let value = o2[key];
      if (o1[key] === undefined) {
        tempNewObj[key] = value;
      } else {
        tempNewObj[key] = mergeJSON(o1[key], o2[key]);
      }
    }
  } else if (o1.length > 0 && typeof o1 !== "string") {
    for (let index in o2) {
      if (JSON.stringify(o1).indexOf(JSON.stringify(o2[index])) === -1) {
        //look for existing id in same section
        let i = tempNewObj.findIndex((element) => element.id == o2[index].id);
        if (i == -1) tempNewObj.push(o2[index]);
        else {
          if (Array.isArray(tempNewObj[i].value)) {
            for (let v in o2[index].value) {
              tempNewObj[i].value.push(o2[index].value[v]);
            }
          } else tempNewObj[i].value = o2[index].value;
        }
      }
    }
  } else {
    tempNewObj = o2;
  }
  return tempNewObj;
}

function getBrowserTime() {
  function padNumber(num, size) {
    const s = num.toString().padStart(size, "0");
    return s;
  }
  const d = new Date();
  return `${d.getFullYear()}-${padNumber(d.getMonth() + 1, 2)}-${padNumber(
    d.getDate(),
    2
  )}-${padNumber(d.getHours(), 2)}-${padNumber(d.getMinutes(), 2)}-${padNumber(
    d.getSeconds(),
    2
  )}`;
}

/*
 * Ugly hack to avoid unwished tab stop to reach button not supposed to be accessed
 *
 */
function disableNode(node, state) {
  if (!node) return;
  let nodeList = node.children;
  if (nodeList) {
    for (var i = 0; i < nodeList.length; i++) {
      disableNode(nodeList[i], state);
    }
  }
  if (state) node.setAttribute("disabled", "true");
  else node.removeAttribute("disabled");
}

export {
  capitalize,
  createComponent,
  disableNode,
  espHttpURL,
  generateUID,
  getBrowserTime,
  getColClasses,
  getCookie,
  hslToHex,
  limitArr,
  mergeJSON,
  mergeFlatPrefToNestedSchema,
  parseFileSizeString,
  removeEntriesByIDs,
};