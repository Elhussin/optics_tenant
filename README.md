# optics_tenant


# تشغيل حاوية Redis باستخدام Docker
docker run -d --name optics-redis -p 6379:6379 redis:alpine

## تشغيل Celery Worker (باستخدام pdm)
pdm run celery -A optics_tenant worker -l info --pool=solo

