# # مرحلة البناء
# FROM node:18-alpine AS builder
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build

# # مرحلة التشغيل
# FROM node:18-alpine AS runner
# WORKDIR /app
# COPY --from=builder /app ./
# EXPOSE 3000
# CMD ["npm", "start"]
# استخدم صورة Bun الرسمية
# FROM oven/bun:1 AS builder

# WORKDIR /app

# # نسخ الملفات
# COPY package.json bun.lock ./
# RUN bun install

# COPY . .

# # بناء المشروع
# RUN bun run build

# # مرحلة التشغيل
# FROM oven/bun:1 AS runner
# WORKDIR /app

# COPY --from=builder /app ./

# EXPOSE 3000
# CMD ["bun", "run", "start"]




# # مرحلة البناء - باستخدام Node
# FROM node:20 AS builder

# WORKDIR /app

# COPY package.json package-lock.json ./
# RUN npm install

# COPY . .

# RUN npm run build

# # مرحلة التشغيل - باستخدام Bun
# FROM oven/bun:1 AS runner
# WORKDIR /app

# COPY --from=builder /app ./

# EXPOSE 3000
# CMD ["bun", "run", "start"]


# اختار نسخة Node مناسبة
FROM node:20-alpine

# تثبيت pnpm عالميًا
RUN npm install -g pnpm

# تعيين مجلد العمل
WORKDIR /app

# نسخ الملفات
COPY package.json pnpm-lock.yaml* ./

# تثبيت الحزم
RUN pnpm install --frozen-lockfile

# نسخ باقي المشروع
COPY . .

# تشغيل التطبيق
CMD ["pnpm", "start"]
