"use client";

import { useEffect, useState } from "react";

function useWasm(path: string) {
  const [state, setState] = useState<[any, boolean, Error | null]>([
    null,
    true,
    null,
  ]);
  useEffect(() => {
    async function getWasm(path: string) {
      try {
        await import("./wasm_exec.js");

        // @ts-ignore
        const go = new Go(); // Defined in wasm_exec.js
        // go.importObject.env = {
        //   add: function (x: number, y: number) {
        //     return x + y;
        //   },
        // };
        const WASM_URL = path;

        var wasm;

        const resp = await fetch(`${window.location.origin}${WASM_URL}`);
        const bytes = await resp.arrayBuffer();
        const obj = await WebAssembly.instantiate(bytes, go.importObject);
        wasm = obj.instance;
        (globalThis as any).__parse_terraform_config_wasm__ = {};
        go.run(wasm);
        console.log(
          (globalThis as any).__parse_terraform_config_wasm__.parse(
            "main.tf",
            `provider "coder" {
}`,
            () => {}
          )
        );
        return wasm.exports;
      } catch (e) {
        console.log(e);
        return {};
      }
    }

    getWasm(path)
      .then((exp) => {
        setState([exp, false, null]);
      })
      .catch((err) => {
        setState([null, false, err]);
      });
  }, [path]);
  return state;
}

export default function Home() {
  const mod = useWasm("/main.wasm");
  // console.log("wasm", mod);

  return "";
}
