# Container management mechanism in serverless edge computing environment
A master's thesis project at Poznan University of Technology.  
Full master thesis(in polish) is available for reading [here](masters_thesis_in_polish.pdf).

### Table of Contents
1. [Description](#description)
2. [Architecture](#architecture)
3. [Functional requirements](#functional-requirements)
4. [Implementation](#implementation)
5. [Examples of application operation](#examples-of-application-operation)


## Description
A goal of this master's thesis was to implement a container management mechanism in serverless edge computing 
environment. Implementation offers a serverless platform that lets client to make computations both by requesting 
an invocation of a function in a container in cloud and ability to make all or part of computations by 
client (ability to perform edge computing) by sending him function's content. As a result, client can pass the results
of his computations in a request body for invocation of another function that performs rest of the computations. In this 
case the cloud won't perform calculations already done by client, but use them to perform rest of the computations. 
Moreover, functions marked as idempotent(pure functions) will return HTTP response containing not only their result but
also a cache containing results of their execution for given inputs. If a client include cache content in request body for
an invocation of the same function with the same arguments then he will get back results immediately because an invocated
function will use the results of received cache instead of performing computation on its own. Moreover, if a client
would like to use third party libraries he can define them in a package.json file and they will be automatically installed
during container initialization.

## Architecture
<img src="./figures/architecture.png" width=400 height=400 alt="cos">

<!---
![Alt text](figures/architecture.png)
-->

## Functional requirements
1. Client has a possibility of creating an account enabling him using proposed solution.
2. Client has a possibility of logging to his account.
3. Client has a possibility of resetting his password by requesting and then receiving an email message containing
a link enabling password reset.
4. Client has a possibility of creating, modifying and deleting an application, its function or endpoint.
5. Client has a possibility of defining a file with third library dependencies which will be used for application's 
functions implementation.
6. When implementing a function, client has possibility of invoking in its codes other functions with arbitrary input 
arguments.
7. Client has a possibility of testing created function by invoking it with arbitrary input arguments.
8. Client has a possibility of starting and stopping application.
9. Client has a possibility of sending requests for a running application and its endpoints for invoking a function 
assigned to this endpoint.
10. Client must get a result of invoked function and get a cache for idempotent functions.
11. Client has a possibility of passing cache content in request body for computation acceleration.
12. Client has a possibility of using edge computing by downloading codes of chosen functions and invoking them locally
and next he can pass their results in HTTP request body for computation acceleration.


## Implementation 

## Examples of application operation
