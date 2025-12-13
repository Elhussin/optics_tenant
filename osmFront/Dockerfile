# ========================================
# مرحلة البناء
# ========================================

# المرحلة الأولى: بناء المشروع
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Define build arguments for Next.js
ARG NEXT_PUBLIC_API_BASE
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE

RUN npm run build
# ========================================
# مرحلة التشغيل
# ========================================
FROM node:20-alpine AS runner

WORKDIR /app

RUN corepack enable && corepack prepare npm@latest --activate

COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps --prod --frozen-lockfile

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

# إنشاء مستخدم غير root وصلاحيات
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app

USER nextjs

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["npm", "run", "start"]


