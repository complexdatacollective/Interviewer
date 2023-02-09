# networkQuery [![Build Status](https://travis-ci.org/codaco/networkQuery.svg?branch=master)](https://travis-ci.org/codaco/networkQuery)
utility for querying against a network

## Methods

### `query(network, query)`
Query a network, and return a boolean depending on whether the query matches.

A query can be comprised of multiple rules, joined by an operator.

### `filter(network, query)`

Filter a network by one or more queries, returning a network. Queries
are joined by an operator which determines if the network is filtered
cumulatively (AND) or if any query can match each entity (OR).
