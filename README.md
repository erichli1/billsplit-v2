## TLDR

Multiplayer bill splitting by proportion of subtotal paid.

## Problem

Existing bill splitting apps require users to split on total rather than subtotal. However, tax and tip should be divided proportional to the amount of subtotal paid, and it becomes an intensive accounting task to correctly divvy up costs among people. This problem is exacerbated on group trips where up to ten people are ordering different things at different price points.

## Solution

This billsplitting app allows for room creation and link sharing. Adding people and items to the bill is synchronized across all users, allowing for an entire table to quickly split the bill according to who ate what.

## Setup

`npm i` installs the necessary packages and `npm run dev` runs the app locally. Note this project is built on top of [Convex](https://www.convex.dev/) and requires an account on there.