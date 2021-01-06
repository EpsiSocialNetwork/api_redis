# Redis API PostHoop
> cbarange | 29th December 2020
---

> [doc : https://documenter.getpostman.com/view/10780597/TVzNHeRc](https://documenter.getpostman.com/view/10780597/TVzNHeRc)

## Get started
```bash
yarn init
yarn add express helmet cors dotenv morgan redis
yarn dev # development
yarn start # production

#sudo docker run --rm -it --name redis redis
```

## Install REDIS

```bash
sudo apt update
sudo apt install -y redis-server

sudo systemctl status redis.service
redis-cli ping

redis-server redis_posthoop.conf

# Monitoring
redis-cli info stats
redis-cli info server
redis-cli info
```

**Docker**
```bash
# TODO
```

**Config**
```bash
bind 0.0.0.0
port 6379
requirepass Epsi2020!

tcp-backlog 511
tcp-keepalive 300

save 900 1
save 300 10
save 60 10000

dbfilename dump.rdb
dir ./
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