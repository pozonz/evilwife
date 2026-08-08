<?php

namespace Pozo\EvilWife\Portal\Cms\Security;

use Pozo\EvilWife\Core\ORM\User;
use Scheb\TwoFactorBundle\Model\PersisterInterface;

class UserPersister implements PersisterInterface
{
    public function persist(object $user): void
    {
        if (!$user instanceof User) {
            throw new \InvalidArgumentException(sprintf('Expected instance of %s.', User::class));
        }

        $user->save();
    }
}
