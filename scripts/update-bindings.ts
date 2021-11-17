#!/usr/bin/env -S deno run --allow-all

import paramCase from "https://deno.land/x/case@v2.1.0/paramCase.ts";
import Schema, { Type, string, number, array } from 'https://denoporter.sirjosh.workers.dev/v1/deno.land/x/computed_types/src/index.ts';
import { parse, Args } from "https://deno.land/std@0.114.0/flags/mod.ts"

const StructSchema = Schema({
  name: string,
  description: string,
  fields: array.of(Schema({
    name: string,
    type: string,
    description: string,
  })),
})

const EnumSchema = Schema({
  name: string,
  description: string,
  values: array.of(Schema({
    name: string,
    value: number.integer(),
    description: string,
  })),
})

const FunctionSchema = Schema({
  name: string,
  description: string,
  returnType: string,
  params: Schema.record(string, string).optional(),
})

const RaylibApiSchema = Schema({
  structs: array.of(StructSchema),
  enums: array.of(EnumSchema),
  functions: array.of(FunctionSchema),
})

const args = checkArgs(Deno.args)

if ("fetch" in args) {
  console.log(args)
  throw new Error("Unimplemented")
} else {
  const data = await Deno.readTextFile(args.local);
  const json: unknown = JSON.parse(data)
  genFiles(json, args.emitOnly)
}

type CliArgs = ({ fetch: string } | { local: string }) & { emitOnly: boolean }
function checkArgs(args: string[]): CliArgs {
  const { fetch, local, emitOnly } = parse(args, {
    alias: {
      fetch: "f",
      local: "l",
      emitOnly: ["e", "emit-only"],
    },
    string: ["fetch", "local"],
    boolean: ["emitOnly"],
  })

  if (fetch && local) {
    throw new Error("The flags --fetch and --local can not be used at the same time")
  } else if (!fetch && !local) {
    throw new Error("One of the flags --fetch or --local need to be used")
  }

  if (fetch) {
    return { emitOnly, fetch }
  } else {
    return { emitOnly, local }
  }
}

function genFiles(json: any, emitOnly: boolean) {
  console.log(RaylibApiSchema(json))
}

