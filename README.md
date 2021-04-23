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
sudo docker run --rm -it --name redis redis
sudo docker build -t react-api-poshtoop .
sudo docker run --rm -it --name react-api -p 5225:5225 -e HOST_REDIS=192.168.1.17 react-api-poshtoop

# Push image
cat ~/TOKEN.txt | docker login https://docker.pkg.github.com -u USERNAME --password-stdin
docker tag IMAGE_ID docker.pkg.github.com/OWNER/REPOSITORY/IMAGE_NAME:VERSION
docker push docker.pkg.github.com/OWNER/REPOSITORY/IMAGE_NAME:VERSION


cat ~/GITHUB_PACKAGE_TOKEN.txt |sudo docker login https://docker.pkg.github.com -u cbarange --password-stdin

sudo docker tag f0f172db3b26 docker.pkg.github.com/epsisocialnetwork/api_redis/react_api_poshtoop:1
sudo docker push docker.pkg.github.com/epsisocialnetwork/api_redis/react_api_poshtoop:1
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

unixsocket /tmp/redis.sock
unixsocketperm 700

daemonize yes
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

## Kubernetes

```bash

kubectl create secret docker-registry api-react-secret-github --docker-server="docker.pkg.github.com" --docker-username="cbarange" --docker-password="ghp_456dAZdzdza465fzefdhouvnzVUi" --docker-email="dza@gmail.com" -n react-api-namespace


kubectl apply -f react_api_namespace.yaml

kubectl -n react-api-namespace delete pods --field-selector=status.phase=Failed # --all

kubectl rollout restart deployment api-react-deployment -n react-api-namespace

kubectl exec -it api-react-deployment-457813dfs -n react-api-namespace -- sh
#kubectl scale deployment.v1.apps/react-api-deployment --replicas=3
```

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: react-api-namespace
``` 

```yaml
apiVersion: v1
kind: Service
metadata:
  name: react-api-service
  namespace: react-api-namespace
  labels:
    app: react-api
spec:
  type: ClusterIP
  ports:
  - name: http
    port: 5225
    targetPort: 5225
    protocol: TCP
  selector:
    app: react-api
```

```yaml
apiVersion: traefik.containo.us/v1alpha1
metadata:
  name: api-react-ingress
  namespace: react-api-namespace
spec:
  entrypoints:
    - http
    - https
  routes:
  - match: Host(`react.mignon.chat`)
  kind: Rule
  services:
  - name: react-api
    port: 5225
  tls:
    certResolver: letsencrypt
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: react-api-deployment
  namespace: react-api-namespace
  labels:
    app: react-api
spec:
  hostAliases:
  - ip: "192.168.4.150"
    hostnames:
    - "keycloak.mignon.chat"
  replicas: 1
  selector:
    matchLabels:
      app: react-api
  template:
    metadata:
      labels:
        app: react-api
    spec:
      containers:
      - name: react-api
        image: docker.pkg.github.com/epsisocialnetwork/api_redis/react_api_poshtoop:1
        ports:
        - containerPort: 5225
        env:
          - name: HOST_REDIS
            value: "192.168.4.201"
      imagePullSecrets:
      - name: api-react-secret-github
```