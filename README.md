# Redis API PostHoop
> cbarange | 29th December 2020
---

## Get started
```bash
yarn init
yarn add express helmet cors dotenv morgan
yarn dev
yarn start

# Post
HMSET post:uid view INT share INT
ZADD post:uid:react INT STRING
SADD post:uid:like username1 username2 ... # user who liked, sismember & scard

sudo docker run --rm -it --name redis redis

```

## More 
```bash
EXISTS key
SET key value
#eg set server:name "fido"
GET key

INCR key
DEL key
INCRBY key increment_value
DECR
DECRBY key increment_value

EXPIRE key time_value
TTL key # -1 : Persitant key, -2 : Key does not exist, int : Time To Live
PERSIST key # Set TTL to -1
SET key value EX time_to_live_value

# ARRAY
RPUSH list_key value
RPUSH list_key value # RPUSH friends "Jean" "Victor" "Michel"
LPUSH list_key value # Add element at beginning
LLEN list_key

LRANGE list_key beginning_index end_index # Like slice : LRANGE friends 1 2

LPOP list_key
RPOP list_key

# SET
SADD set_key value
SREM set_key value
SISMEMBER set_key value
SMEMBERS set_key
SUNION set_key set_key
SPOP set_key number_element # SRANDMEMBER

# SORTED SET by score
ZADD set_key score value
ZRANGE set_key 0 -1 # Retrieve all data

# HSET like a struct



```