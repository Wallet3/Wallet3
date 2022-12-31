import { utils } from 'ethers';

export async function getMetadata(chainId: number | string, contract: string) {
  const url = `https://repo.sourcify.dev/contracts/full_match/${chainId}/${utils.getAddress(contract)}/metadata.json`;

  try {
    const resp = await fetch(url);
    return (await resp.json()) as ISourcifyMetadata;
  } catch (error) {}
}

interface Compiler {
  version: string;
}

interface Input {
  internalType: string;
  name: string;
  type: string;
}

interface Output2 {
  internalType: string;
  name: string;
  type: string;
}

interface Abi {
  inputs: Input[];
  name: string;
  outputs: Output2[];
  stateMutability: string;
  type: string;
}

interface Methods {
  [method: string]: any;
}

interface Devdoc {
  kind: string;
  methods: Methods;
  version: number;
}

interface Methods2 {
  [method: string]: { notice: string };
}

interface Userdoc {
  kind: string;
  methods: Methods2;
  notice: string;
  version: number;
}

interface Output {
  abi: Abi[];
  devdoc: Devdoc;
  userdoc: Userdoc;
}

interface CompilationTarget {
  [file: string]: any;
}

interface Libraries {}

interface Metadata {
  bytecodeHash: string;
  useLiteralContent: boolean;
}

interface Optimizer {
  enabled: boolean;
  runs: number;
}

interface Settings {
  compilationTarget: CompilationTarget;
  evmVersion: string;
  libraries: Libraries;
  metadata: Metadata;
  optimizer: Optimizer;
  remappings: any[];
}

interface Sources {
  [file: string]: any;
}

export interface ISourcifyMetadata {
  compiler: Compiler;
  language: string;
  output: Output;
  settings: Settings;
  sources: Sources;
  version: number;
}
