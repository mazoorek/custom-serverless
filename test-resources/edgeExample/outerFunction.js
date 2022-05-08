(args) => {
    let output = call("inner-function",({"a": args.a, "b": args.b}));
    return {out: output.result * args.c};
};
