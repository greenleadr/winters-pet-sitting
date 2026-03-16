'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { LogOutIcon, UserPlusIcon, UserIcon, ShieldIcon, KeyIcon, TrashIcon, PawPrintIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/lib/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import CollapsibleSection from '@/components/ui/CollapsibleSection';
import Badge from '@/components/ui/Badge';

interface SettingsClientProps {
  currentUser: User;
  profile: Profile | null;
  allProfiles: Profile[];
  isOwner: boolean;
}

export default function SettingsClient({
  currentUser,
  profile,
  allProfiles,
  isOwner,
}: SettingsClientProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  // Helper invite state
  const [helperEmail, setHelperEmail] = useState('');
  const [helperPassword, setHelperPassword] = useState('');
  const [helperName, setHelperName] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [inviteError, setInviteError] = useState('');

  // Profile update state
  const [displayName, setDisplayName] = useState(profile?.full_name || '');
  const [updatingName, setUpdatingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState('');

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const handleUpdateName = async () => {
    setUpdatingName(true);
    setNameSuccess('');
    const supabase = createClient();
    await supabase
      .from('profiles')
      .update({ full_name: displayName.trim() })
      .eq('id', currentUser.id);
    setNameSuccess('Name updated!');
    setUpdatingName(false);
    router.refresh();
  };

  const handleCreateHelper = async () => {
    if (!helperEmail.trim() || !helperPassword.trim()) {
      setInviteError('Email and password are required.');
      return;
    }
    if (helperPassword.length < 8) {
      setInviteError('Password must be at least 8 characters.');
      return;
    }

    setInviting(true);
    setInviteError('');
    setInviteSuccess('');

    const supabase = createClient();

    // Use admin sign-up (this works if you're using service role key, otherwise
    // the helper will need to confirm their email — provide instructions)
    const { data, error } = await supabase.auth.signUp({
      email: helperEmail.trim(),
      password: helperPassword.trim(),
      options: {
        data: { role: 'helper', full_name: helperName.trim() },
      },
    });

    if (error) {
      setInviteError(error.message);
      setInviting(false);
      return;
    }

    // Update the helper's profile role to 'helper'
    if (data.user) {
      await supabase
        .from('profiles')
        .update({ role: 'helper', full_name: helperName.trim() || null })
        .eq('id', data.user.id);
    }

    setInviteSuccess(
      `Helper account created for ${helperEmail}. Share the credentials with your helper.`
    );
    setHelperEmail('');
    setHelperPassword('');
    setHelperName('');
    setInviting(false);
    router.refresh();
  };

  const helpers = allProfiles.filter((p) => p.role === 'helper');

  return (
    <div className="px-4 py-3 space-y-3">
      {/* Account Info */}
      <CollapsibleSection
        title="My Account"
        icon={<UserIcon className="h-4 w-4 text-gray-600" />}
        defaultOpen={true}
      >
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-sm font-medium text-gray-900">{currentUser.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-500">Role</p>
            <Badge variant={isOwner ? 'green' : 'blue'}>{isOwner ? 'Owner' : 'Helper'}</Badge>
          </div>

          {/* Display name */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                label="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleUpdateName}
              loading={updatingName}
              className="mb-0.5"
            >
              Save
            </Button>
          </div>
          {nameSuccess && <p className="text-xs text-emerald-600">{nameSuccess}</p>}
        </div>
      </CollapsibleSection>

      {/* Helper Management - owner only */}
      {isOwner && (
        <CollapsibleSection
          title="Helper Account"
          icon={<ShieldIcon className="h-4 w-4 text-blue-600" />}
          defaultOpen={false}
          badge={helpers.length || undefined}
        >
          <div className="space-y-4">
            <p className="text-xs text-gray-600">
              A helper can view and edit clients and appointments but cannot delete clients or manage accounts.
            </p>

            {/* Existing helpers */}
            {helpers.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-700">Current Helpers</p>
                {helpers.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {h.full_name || h.email || 'Helper'}
                      </p>
                      {h.email && h.full_name && (
                        <p className="text-xs text-gray-500">{h.email}</p>
                      )}
                    </div>
                    <Badge variant="blue">Helper</Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Create helper */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-700">
                {helpers.length > 0 ? 'Add Another Helper' : 'Create Helper Account'}
              </p>
              <Input
                label="Helper Name"
                value={helperName}
                onChange={(e) => setHelperName(e.target.value)}
                placeholder="e.g. Sarah"
              />
              <Input
                label="Helper Email *"
                type="email"
                value={helperEmail}
                onChange={(e) => setHelperEmail(e.target.value)}
                placeholder="helper@example.com"
              />
              <Input
                label="Password *"
                type="password"
                value={helperPassword}
                onChange={(e) => setHelperPassword(e.target.value)}
                placeholder="Min. 8 characters"
                hint="Share this with your helper"
              />

              {inviteError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">
                  {inviteError}
                </p>
              )}
              {inviteSuccess && (
                <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                  {inviteSuccess}
                </p>
              )}

              <Button
                fullWidth
                onClick={handleCreateHelper}
                loading={inviting}
                className="gap-1.5"
              >
                <UserPlusIcon className="h-4 w-4" />
                Create Helper Account
              </Button>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* App info */}
      <CollapsibleSection
        title="About"
        icon={<PawPrintIcon className="h-4 w-4 text-emerald-600" />}
        defaultOpen={false}
      >
        <div className="space-y-2 text-sm text-gray-600">
          <p className="font-semibold text-gray-900">Winter&apos;s Pet Sitting &amp; House Cleaning</p>
          <p>Client management app for pet sitting and house cleaning services.</p>
          <div className="pt-2 space-y-1 text-xs text-gray-500">
            <p>Version 1.0.0</p>
            <p>Built with Next.js + Supabase</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Sign Out */}
      <div className="pt-2 pb-4">
        <Button
          variant="secondary"
          fullWidth
          onClick={handleLogout}
          loading={loggingOut}
          className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOutIcon className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
