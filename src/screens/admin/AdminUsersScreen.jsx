import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loader } from '@/components/ui/Loader';
import { Colors } from '@/constants/Colors';
import { adminService } from '@/services/admin';
import { getAuthData } from '@/utils/storage';

export function AdminUsersScreen() {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  const load = useCallback(async () => {
    const [data, authData] = await Promise.all([adminService.listUsers(), getAuthData()]);
    setUsers(data);
    if (authData) setCurrentUserId(String(authData.user.user_id ?? authData.user.$id));
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        String(u.phone || '').includes(q)
    );
  }, [users, query]);

  const renderItem = ({ item }) => {
    const isSelf = String(item.user_id) === currentUserId;
    const isAdmin = item.role === 'admin';
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.75}
        onPress={() => navigation.navigate('AdminUserEnrollments', { user: item })}
      >
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>{item.name?.charAt(0)?.toUpperCase() || '?'}</Text>
          </View>
        )}

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name || 'Unnamed'}
            </Text>
            {isAdmin && (
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={10} color={Colors.primary} />
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
          </View>
          <Text style={styles.email} numberOfLines={1}>
            {item.email}
          </Text>
          {item.phone ? <Text style={styles.phone}>{String(item.phone)}</Text> : null}
          {isSelf && <Text style={styles.youTag}>This is you</Text>}
        </View>

        <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AdminHeader
        title="Users"
        subtitle={`${users.length} registered`}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email or phone"
          placeholderTextColor={Colors.textLight}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <Loader />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.user_id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="No Users Found"
              description={query ? 'Try a different search.' : 'No registered users yet.'}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
    padding: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    flexShrink: 1,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 150, 137, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  email: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  phone: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 1,
  },
  youTag: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
