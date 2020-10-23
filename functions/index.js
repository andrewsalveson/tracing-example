const tracer = require("@google-cloud/trace-agent").get();

exports.justASec = (req, res) => {
    
    const traceHeader = req.headers[tracer.constants.TRACE_CONTEXT_HEADER_NAME];
    const traceContext = tracer.getResponseTraceContext(traceHeader, traceHeader);
    tracer.runInRootSpan({
        traceContext,
        name: 'running-just-a-sec',
    }, rootSpan => {    
        //const headers = Object.keys(req.headers).join(", ");
        setTimeout(() => {
            const span = tracer.createChildSpan({name: 'counting'});
            for (let i = 0; i < 100000; i++) {
                if (i === 99999) {
                    console.log("almost done");
                }
            }
            span.endSpan();
            rootSpan.endSpan();
            res.send(`incoming context: ${traceHeader}`);
        },1000);  
    });
};

exports.wobbles = (req, res) => {
    const traceHeader = req.headers[tracer.contstants.TRACE_CONTEXT_HEADER_NAME];
    const traceContext = tracer.getResponseTraceContext(traceHeader, traceHeader);
    tracer.runInRootSpan({
        traceContext,
        name: 'running-wobbles',
    }, rootSpan => {
        if (Math.random() < 0.5) {
            const err = new Error("random planned error");
            rootSpan.addLabel('error', err);
            rootSpan.endSpan();
            throw err;
        }
        setTimeout(() => {
            rootSpan.endSpan();
            res.send("didn't fall over");
        }, 1000);
    });
};
