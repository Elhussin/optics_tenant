// Skeleton
import { Skeleton, SkeletonGroup } from '@/src/shared/components/ui/Skeleton';
<Skeleton variant="title" />
    <SkeletonGroup type="card" count = { 3} />

// GlassCard
import { GlassCard, GlassCardHeader } from '@/src/shared/components/ui/GlassCard';
<GlassCard variant="primary" hover animate = "fade-in" >
    <GlassCardHeader title="عنوان" icon = {< Icon />} />
        < p > محتوى </p>
        </GlassCard>

// Badge
import { Badge, CountBadge, StatusBadge } from '@/src/shared/components/ui/Badge';
<Badge variant="success" dot > نشط </Badge>
    < CountBadge count = { 5} />
        <StatusBadge status="online" />

// Avatar
import { Avatar, AvatarGroup } from '@/src/shared/components/ui/Avatar';
<Avatar name="محمد أحمد" status = "online" size = "lg" />
    <AvatarGroup avatars={ [...] } max = { 4} />

// EmptyState
import { EmptyState } from '@/src/shared/components/ui/EmptyState';
<EmptyState 
  type="search"
action = {< Button > إضافة </Button>}
/>

// Spinner
import { Spinner, LoadingOverlay } from '@/src/shared/components/ui/Spinner';
<Spinner size="lg" />
    <LoadingOverlay show={ loading } message = "جاري التحميل" />