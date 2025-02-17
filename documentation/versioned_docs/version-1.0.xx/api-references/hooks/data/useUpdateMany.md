---
id: useUpdateMany
title: useUpdateMany
siderbar_label: useUpdateMany
description: useUpdateMany data hook from refine is a modified version of react-query's useMutation for multiple update mutations
---

`useUpdateMany` is a modified version of `react-query`'s [`useMutation`](https://react-query.tanstack.com/reference/useMutation#) for multiple update mutations. It uses `updateMany` method as mutation function from the [`dataProvider`](api-references/providers/data-provider.md) which is passed to `<Refine>`.

## Features

* Shows notifications after the mutation succeeds, fails, or gets canceled.

* Automatically invalidates `list` and `getOne` queries after the mutation is succesfully run.
[Refer to React Query docs for detailed information &#8594](https://react-query.tanstack.com/guides/invalidations-from-mutations)

* Supports [mutation mode](#mutation-mode).


## Usage

Let's say that we have a resource named `posts`.

```ts title="https://api.fake-rest.refine.dev/posts"
{
    [
        {
            id: 1,
            status: "published",
        },
        {
            id: 2,
            status: "rejected",
        },
    ];
}
```

```tsx 
type PostMutationResult = {
    id: string;
    status: "published" | "draft" | "rejected";
}

import { useUpdateMany } from "@pankod/refine";

const { mutate } = useUpdateMany<PostMutationResult>();

mutate({ 
    resource: "posts",
    ids: [ "1", "2" ],
    values: { status: "draft" },
});
```

:::tip
`mutate` can also accept lifecycle methods like `onSuccess` and `onError`.
[Refer to react-query docs for further information. &#8594](https://react-query.tanstack.com/guides/mutations#mutation-side-effects)
:::

<br/>

After mutation runs `posts` will be updated as below:

```ts title="https://api.fake-rest.refine.dev/posts" {5,9}
{
    [
        {
            id: 1,
            status:"draft"
        },
        {
            id: 2,
            status:"draft"
        },
    ];
}
```
<br/>

:::note
Queries that use `/posts` endpoint will be automatically invalidated to show the updated data. For example, data returned from [`useList`](useList.md) and [`useOne`](useOne.md) will be automatically updated.
:::

:::tip
`useUpdateMany` returns `react-query`'s `useMutation` result which includes [a lot properties](https://react-query.tanstack.com/reference/useMutation), one of which being `mutate`.
:::

:::important
Values passed to `mutate` must have these types:

```tsx
{
    resource: string;
    ids: string[];
    values: TVariables = {};
    mutationMode?: MutationMode;
    undoableTimeout?: number;
    onCancel?: (cancelMutation: () => void) => void;
}
```
:::

## Mutation mode

Mutation mode determines the mode which mutation runs with.

```tsx  {8}
import { useUpdateMany } from "@pankod/refine";

const { mutate } = useUpdateMany();

mutate({
    resource: "posts",
    ids: [ "1", "2" ],
    values: { status: "draft" },
    mutationMode: "optimistic",
});
```



[Refer to mutation mode docs for further information. &#8594](guides-and-concepts/mutation-mode.md)


### Creating a custom method for cancelling mutations
You can pass a custom cancel callback to `useUpdateMany`. This callback is triggered instead of the default one when undo button is clicked when  `mutationMode = "undoable"`.

:::caution
Default behaviour on undo action includes notifications. If a custom callback is passed this notification will not appear.
:::

:::danger
Passed callback will receive a function that actually cancels the mutation. Don't forget to run this function to cancel the mutation on `undoable` mode.

```tsx  {2-5,14-16}
import { useUpdateMany } from "@pankod/refine";

const customOnCancel = (cancelMutation: () => void) => {
    cancelMutation();
    // rest of custom cancel logic...
}


const { mutate } = useUpdateMany();

mutate({ 
    resource: "posts",
    ids: [ "1", "2" ],
    values: { status: "draft" },
    mutationMode: "undoable",
    undoableTimeout: 7500,
    onCancel: customOnCancel
});
```
After 7.5 seconds the mutation will be executed. The mutation can be cancelled within that 7.5 seconds. If cancelled `customOnCancel` will be executed and the request will not be sent.
:::

<br />

## API

### Properties


| Property                                                                                            | Description                                                                     | Type                                                                       | Default                                                      |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------ |
| <div className="required-block"><div>resource</div> <div className=" required">Required</div></div> | [`Resource`](/api-references/components/resource.md) for API data interactions  | `string`                                                                   |                                                              |
| id  <div className=" required">Required</div>                                                       | id for mutation function                                                        | `string`                                                                   |                                                              |
| values  <div className=" required">Required</div>                                                   | Values for mutation function                                                    | `TVariables[]`                                                             | [{}]                                                         |
| mutationMode                                                                                        | [Determines when mutations are executed](/guides-and-concepts/mutation-mode.md) | ` "pessimistic` \| `"optimistic` \| `"undoable"`                           | `"pessimistic"`*                                             |
| undoableTimeout                                                                                     | Duration to wait before executing the mutation when `mutationMode = "undoable"` | `number`                                                                   | `5000ms`*                                                    |
| onCancel                                                                                            | Callback that runs when undo button is clicked on `mutationMode = "undoable"`   | `(cancelMutation: () => void) => void`                                     |                                                              |
| successNotification                                                                                 | Successful Mutation notification                                                | [`SuccessErrorNotification`](../../interfaces.md#successerrornotification) | "Successfully updated `resource`"                            |
| errorNotification                                                                                   | Unsuccessful Mutation notification                                              | [`SuccessErrorNotification`](../../interfaces.md#successerrornotification) | "Error when updating `resource` (status code: `statusCode`)" |
| metaData                                            | Metadata query for `dataProvider`                                              | [`MetaDataQuery`](/api-references/interfaces.md#metadataquery)           | {}                                                                   |

>`*`: These props have default values in `RefineContext` and can also be set on **<[Refine](api-references/components/refine-config.md))>** component. `useUpdateMany` will use what is passed to `<Refine>` as default but a local value will override it.

<br/>

### Type Parameters

| Property   | Desription                                                                          | Type                                           | Default                                        |
| ---------- | ----------------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- |
| TData      | Result data of the mutation. Extends [`BaseRecord`](../../interfaces.md#baserecord) | [`BaseRecord`](../../interfaces.md#baserecord) | [`BaseRecord`](../../interfaces.md#baserecord) |
| TError     | Custom error object that extends [`HttpError`](../../interfaces.md#httperror)       | [`HttpError`](../../interfaces.md#httperror)   | [`HttpError`](../../interfaces.md#httperror)   |
| TVariables | Values for mutation function                                                        | `{}`                                           | `{}`                                           |

### Return value

 | Description                               | Type                                                                                                                                                                                                        |
 | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
 | Result of the `react-query`'s useMutation | [`UseMutationResult<`<br/>`{ data: TData },`<br/>`TError,`<br/>`  { resource:string; ids: string[]; values: TVariables; },`<br/>` UpdateContext>`](https://react-query.tanstack.com/reference/useMutation)* |

>`*` `UpdateContext` is an internal type.
